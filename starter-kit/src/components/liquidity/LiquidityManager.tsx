import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import SimpleBar from 'simplebar-react';
import { Icon } from '@iconify/react';
import { Badge } from 'flowbite-react';
import { useWallet } from 'src/hooks/useWallet';
import { fetchWalletTokens, fetchProtocolPositions, ProtocolPosition } from 'src/services/portfolioService';

// Ethereum provider interface is already declared in useWallet.ts

// Types for our liquidity management
interface TokenPosition {
    id: string;
    symbol: string;
    name: string;
    amount: number;
    valueUSD: number;
    icon: string;
    decimals: number;
    address: string;
    apy?: number; // For protocol positions
    isSuggested?: boolean; // For suggested deposits
}

interface LiquidityColumn {
    id: string;
    name: string;
    type: 'wallet' | 'protocol';
    icon?: string;
    color: string;
    tokens: TokenPosition[];
    protocolAddress?: string;
}

// Helper function to estimate APY based on protocol
const getEstimatedAPY = (protocolId: string): number | undefined => {
    const apyEstimates: { [key: string]: number } = {
        'pendle': 8.1,
        'aave': 4.2,
        'aavev3': 4.2,
        'curve': 3.8,
        'spark': 7.5,
        'uniswap': 0.3,
        'uniswapv4': 0.3,
        '1inch': 2.1
    };

    return apyEstimates[protocolId.toLowerCase()];
};

// Helper function to generate suggested token deposits for empty protocols
const generateSuggestedTokens = (walletTokens: TokenPosition[], protocolId: string): TokenPosition[] => {
    if (walletTokens.length === 0) return [];

    // Protocol-specific token preferences
    const protocolPreferences: { [key: string]: string[] } = {
        'pendle': ['USDS', 'ETH', 'WETH', 'USDT', 'USDC'],
        'aave': ['USDS', 'USDT', 'USDC', 'DAI', 'ETH', 'WETH'],
        'curve': ['USDS', 'USDT', 'USDC', 'DAI'],
        'spark': ['USDS', 'DAI', 'USDT', 'USDC'],
        'uniswap': ['ETH', 'WETH', 'USDT', 'USDC', 'DAI'],
        '1inch': ['1INCH', 'ETH', 'WETH', 'USDT', 'USDC']
    };

    const preferredTokens = protocolPreferences[protocolId] || ['ETH', 'USDT', 'USDC', 'DAI'];
    const protocolAPY = getEstimatedAPY(protocolId) || 0;

    // Find matching tokens from wallet (max 2)
    const suggestedTokens: TokenPosition[] = [];

    for (const preferredSymbol of preferredTokens) {
        const walletToken = walletTokens.find(token =>
            token.symbol.toUpperCase() === preferredSymbol
        );

        if (walletToken && suggestedTokens.length < 2) {
            suggestedTokens.push({
                id: `suggested-${walletToken.symbol.toLowerCase()}-${protocolId}`,
                symbol: walletToken.symbol,
                name: walletToken.name,
                amount: walletToken.amount,
                valueUSD: walletToken.valueUSD,
                icon: walletToken.icon,
                decimals: walletToken.decimals,
                address: walletToken.address,
                apy: protocolAPY,
                isSuggested: true // Flag to indicate this is a suggestion
            });
        }
    }

    // If no matches found, suggest top 2 wallet tokens
    if (suggestedTokens.length === 0) {
        const topTokens = walletTokens
            .slice(0, 2)
            .map(token => ({
                ...token,
                id: `suggested-${token.symbol.toLowerCase()}-${protocolId}`,
                apy: protocolAPY,
                isSuggested: true
            }));
        suggestedTokens.push(...topTokens);
    }

    return suggestedTokens;
};

const LiquidityManager = () => {
    const { account, isConnected, chainId } = useWallet();
    const [columns, setColumns] = useState<LiquidityColumn[]>([]);
    const [loading, setLoading] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [_dragState, setDragState] = useState<{
        isDragging: boolean;
        draggedToken?: TokenPosition;
        sourceColumn?: string;
    }>({ isDragging: false });
    
    const [isProcessingTransaction, setIsProcessingTransaction] = useState(false);
    const [transactionHash, setTransactionHash] = useState<string | null>(null);
    const [showTransactionSuccess, setShowTransactionSuccess] = useState(false);
    const [originalColumns, setOriginalColumns] = useState<LiquidityColumn[]>([]);
    const [pendingChanges, setPendingChanges] = useState<Array<{
        token: TokenPosition;
        sourceColumn: string;
        destinationColumn: string;
        action: string;
    }>>([]);

    // Initialize columns with wallet and protocols
    const initializeColumns = async () => {
        if (!account) return;

        setLoading(true);
        try {
            // Fetch both wallet tokens and protocol positions in parallel
            const [walletTokens, protocolPositions] = await Promise.all([
                fetchWalletTokens(account, chainId || 1),
                fetchProtocolPositions(account, chainId || 1)
            ]);

            // Convert WalletToken[] to TokenPosition[]
            const walletPositions: TokenPosition[] = walletTokens.map((token, index) => ({
                id: `${token.symbol.toLowerCase()}-wallet-${index}`,
                symbol: token.symbol,
                name: token.name,
                amount: token.amount,
                valueUSD: token.valueUSD,
                icon: token.icon,
                decimals: token.decimals,
                address: token.address
            }));

            // Start with wallet column
            const initialColumns: LiquidityColumn[] = [
                {
                    id: 'wallet',
                    name: 'Wallet',
                    type: 'wallet',
                    icon: 'solar:wallet-bold-duotone',
                    color: 'bg-blue-50 dark:bg-blue-900/20',
                    tokens: walletPositions
                }
            ];

            // Protocol icon and color mappings
            const protocolConfig: { [key: string]: { icon: string; color: string; } } = {
                'pendle': {
                    icon: 'https://cryptologos.cc/logos/pendle-pendle-logo.png?v=040',
                    color: 'bg-orange-50 dark:bg-orange-900/20'
                },
                'aave': {
                    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9/logo.png',
                    color: 'bg-purple-50 dark:bg-purple-900/20'
                },
                'aavev3': {
                    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9/logo.png',
                    color: 'bg-purple-50 dark:bg-purple-900/20'
                },
                'curve': {
                    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xD533a949740bb3306d119CC777fa900bA034cd52/logo.png',
                    color: 'bg-yellow-50 dark:bg-yellow-900/20'
                },
                'spark': {
                    icon: 'https://assets.coingecko.com/coins/images/39926/standard/usds.webp',
                    color: 'bg-pink-50 dark:bg-pink-900/20'
                },
                'uniswap': {
                    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png',
                    color: 'bg-green-50 dark:bg-green-900/20'
                },
                'uniswapv4': {
                    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png',
                    color: 'bg-green-50 dark:bg-green-900/20'
                },
                '1inch': {
                    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x111111111117dC0aa78b770fA6A738034120C302/logo.png',
                    color: 'bg-blue-50 dark:bg-blue-900/20'
                }
            };

            // Define supported protocols (exact list provided)
            const supportedProtocols = ['pendle', 'aave', 'aavev3', 'curve', 'spark', 'uniswap', 'uniswapv4', '1inch'];

            // Collect real protocol positions (only supported ones)
            const realProtocolColumns: LiquidityColumn[] = [];
            protocolPositions.forEach((position: ProtocolPosition) => {
                const protocolId = position.protocolId.toLowerCase();

                // Only show supported protocols
                if (!supportedProtocols.includes(protocolId)) {
                    return;
                }

                const config = protocolConfig[protocolId] || {
                    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
                    color: 'bg-gray-50 dark:bg-gray-900/20'
                };

                // Convert protocol tokens to TokenPosition[] and filter for only tokens with APY
                const protocolTokens: TokenPosition[] = position.tokens
                    .map((token, index) => ({
                        id: `${token.symbol.toLowerCase()}-${protocolId}-${index}`,
                        symbol: token.symbol,
                        name: token.name,
                        amount: token.amount,
                        valueUSD: token.valueUSD,
                        icon: token.icon,
                        decimals: token.decimals,
                        address: token.address,
                        apy: getEstimatedAPY(protocolId) // Add estimated APY for deposits
                    }))
                    .filter(token => token.apy !== undefined); // Only show tokens that have APY

                realProtocolColumns.push({
                    id: protocolId,
                    name: position.protocolName,
                    type: 'protocol',
                    icon: config.icon,
                    color: config.color,
                    tokens: protocolTokens,
                    protocolAddress: '0x0000000000000000000000000000000000000000' // Placeholder
                });
            });

            // Add real protocol columns to initial columns
            initialColumns.push(...realProtocolColumns);

            // Add empty supported protocols that user might want to use
            const defaultProtocols = ['pendle', 'aave', 'curve', 'spark', 'uniswap', '1inch'];
            defaultProtocols.forEach(protocolId => {
                // Only add if not already present
                if (!initialColumns.find(col => col.id === protocolId || col.id === `${protocolId}v2` || col.id === `${protocolId}v3` || col.id === `${protocolId}v4`)) {
                    const config = protocolConfig[protocolId] || {
                        icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
                        color: 'bg-gray-50 dark:bg-gray-900/20'
                    };

                    const displayName = protocolId === '1inch' ? '1inch' : protocolId.charAt(0).toUpperCase() + protocolId.slice(1);

                    initialColumns.push({
                        id: protocolId,
                        name: displayName,
                        type: 'protocol',
                        icon: config.icon,
                        color: config.color,
                        tokens: [], // Empty by default, suggestions shown only during drag
                    protocolAddress: '0x0000000000000000000000000000000000000000'
                    });
                }
            });

            // Sort columns to ensure Pendle comes first among protocols
            const sortedColumns = initialColumns.sort((a, b) => {
                // Keep wallet always first
                if (a.type === 'wallet') return -1;
                if (b.type === 'wallet') return 1;

                // Among protocols, put Pendle first
                if (a.id === 'pendle') return -1;
                if (b.id === 'pendle') return 1;

                // Keep other protocols in their current order
                return 0;
            });

            setColumns(sortedColumns);
            setOriginalColumns(sortedColumns); // Store original state
            setDataLoaded(true);
            setPendingChanges([]); // Clear any pending changes
            console.log('Data loaded successfully. Columns:', initialColumns.length);
        } catch (error) {
            console.error('Error initializing liquidity columns:', error);
            // Don't clear existing data on error, keep what we have
            if (columns.length === 0) {
                // Only set empty state if we had no data before
                setColumns([]);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Manual refresh function
    const handleRefresh = () => {
        setRefreshing(true);
        setDataLoaded(false);
        setPendingChanges([]); // Clear pending changes on refresh
        initializeColumns();
    };

    // Reset data when account changes
    useEffect(() => {
        setDataLoaded(false);
        setColumns([]);
        setPendingChanges([]); // Clear pending changes when account changes
    }, [account]);

    useEffect(() => {
        // Only initialize if we haven't loaded data yet
        if (account && isConnected && !dataLoaded && !loading) {
            initializeColumns();
        }
    }, [account, isConnected, dataLoaded, loading]); // Added dependencies for proper reactivity

    // Handle drag start
    const onDragStart = (start: any) => {
        const { draggableId, source } = start;

        // Find the dragged token
        const sourceColumn = columns.find(col => col.id === source.droppableId);
        const draggedToken = sourceColumn?.tokens.find(token => token.id === draggableId);

        if (draggedToken && sourceColumn) {
            setDragState({
                isDragging: true,
                draggedToken,
                sourceColumn: sourceColumn.id
            });

            // Add suggested tokens to empty protocol columns (for any drag source)
            // Collect all available tokens (from wallet and all protocols)
            const allAvailableTokens: TokenPosition[] = [];
            
            columns.forEach(col => {
                col.tokens.filter(t => !t.isSuggested).forEach(token => {
                    // Avoid duplicates by checking symbol
                    if (!allAvailableTokens.find(t => t.symbol === token.symbol)) {
                        allAvailableTokens.push(token);
                    }
                });
            });

            if (allAvailableTokens.length > 0) {
                const updatedColumns = columns.map(col => {
                    if (col.type === 'protocol' && col.tokens.filter(t => !t.isSuggested).length === 0) {
                        const suggestedTokens = generateSuggestedTokens(allAvailableTokens, col.id);
                        return {
                            ...col,
                            tokens: [...col.tokens.filter(t => !t.isSuggested), ...suggestedTokens]
                        };
                    }
                    return col;
                });
                setColumns(updatedColumns);
            }
        }
    };

    // Handle drag end
    const onDragEnd = (result: any) => {
        const { source, destination, draggableId } = result;

        // Clear drag state
        setDragState({ isDragging: false });

        // Use functional update to ensure we work with latest state
        setColumns(prevColumns => {
            // First, remove all suggested tokens
            let cleanedColumns = prevColumns.map(col => ({
                ...col,
                tokens: col.tokens.filter(t => !t.isSuggested)
            }));

            // If no valid destination, just return cleaned columns
        if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
                return cleanedColumns;
        }

        const sourceColumnId = source.droppableId;
        const destinationColumnId = destination.droppableId;

        console.log(`🔄 Moving token ${draggableId} from ${sourceColumnId} to ${destinationColumnId}`);

        // Create new columns state with the moved token
            const newColumns = [...cleanedColumns];
            const sourceColumn = newColumns.find(col => col.id === sourceColumnId);
            const destinationColumn = newColumns.find(col => col.id === destinationColumnId);

            if (!sourceColumn || !destinationColumn) return cleanedColumns;

            // Get token to move
            const tokenToMove = sourceColumn.tokens[source.index];
            if (!tokenToMove) return cleanedColumns;

            // Remove token from source
            sourceColumn.tokens.splice(source.index, 1);

            // Add token to destination
            destinationColumn.tokens.splice(destination.index, 0, tokenToMove);

            // Track this change
            const action = getTransactionAction(sourceColumn, destinationColumn);
            setPendingChanges(prev => [...prev, {
                token: tokenToMove,
                sourceColumn: sourceColumn.name,
                destinationColumn: destinationColumn.name,
                action: action
            }]);

            console.log(`📝 Tracked change: ${action} ${tokenToMove.symbol} from ${sourceColumn.name} to ${destinationColumn.name}`);

            return newColumns;
        });
    };

    // Handle confirming all pending changes
    const handleConfirmChanges = async () => {
        if (pendingChanges.length === 0 || isProcessingTransaction) return;

        try {
            setIsProcessingTransaction(true);
            
            // Create summary message for signature
            const changesCount = pendingChanges.length;
            const message = `Approve ${changesCount} liquidity movement${changesCount > 1 ? 's' : ''}:\n${pendingChanges.map(change => 
                `${change.action} ${change.token.symbol} from ${change.sourceColumn} to ${change.destinationColumn}`
            ).join('\n')}`;
            
            // Request user signature for all changes
            await requestUserSignature(message);
            
            // Simulate transaction submission and execution
            console.log('🔄 Simulating transaction submission...');
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
            
            // Generate a mock transaction hash
            const mockTxHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
            
            // Execute all pending transactions
            for (const change of pendingChanges) {
                const sourceCol = originalColumns.find(col => col.name === change.sourceColumn);
                const destCol = originalColumns.find(col => col.name === change.destinationColumn);
                if (sourceCol && destCol) {
                    await handleLiquidityMove(change.token, sourceCol, destCol);
                }
            }
            
            // Update original state to current state
            setOriginalColumns([...columns]);
            setPendingChanges([]);
            
            // Set transaction hash and show success
            setTransactionHash(mockTxHash);
            setShowTransactionSuccess(true);
            
            console.log(`✅ Confirmed ${changesCount} changes`);
            console.log(`📝 Transaction Hash: ${mockTxHash}`);
            
            // Auto-hide success message after 5 seconds
            setTimeout(() => {
                setShowTransactionSuccess(false);
                setTransactionHash(null);
            }, 5000);
            
        } catch (error) {
            console.error('Failed to confirm changes:', error);
            // Keep pending changes if signature was rejected
        } finally {
            setIsProcessingTransaction(false);
        }
    };

    // Handle resetting all pending changes
    const handleResetChanges = () => {
        setColumns([...originalColumns]);
        setPendingChanges([]);
        console.log('🔄 Reset all pending changes');
    };

    // Request user signature for the transaction
    const requestUserSignature = async (message: string) => {
        if (!window.ethereum) {
            throw new Error('No wallet connected');
        }
        
        console.log('Requesting signature for:', message);
        
        try {
            const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [message, account],
            });
            
            console.log('User signature received:', signature);
            return signature;
        } catch (error) {
            console.error('User rejected signature:', error);
            throw new Error('Transaction signature required');
        }
    };



    // Get transaction action description
    const getTransactionAction = (sourceColumn: LiquidityColumn, destinationColumn: LiquidityColumn) => {
        if (sourceColumn.type === 'wallet' && destinationColumn.type === 'protocol') {
            return 'deposit';
        } else if (sourceColumn.type === 'protocol' && destinationColumn.type === 'wallet') {
            return 'withdrawal';
        } else if (sourceColumn.type === 'protocol' && destinationColumn.type === 'protocol') {
            return 'transfer';
        }
        return 'transaction';
    };



    // Handle actual liquidity moves (deposits/withdrawals)
    const handleLiquidityMove = async (token: TokenPosition, sourceColumn: LiquidityColumn, destinationColumn: LiquidityColumn) => {
        try {
            if (sourceColumn.type === 'wallet' && destinationColumn.type === 'protocol') {
                console.log(`💰 Depositing ${token.amount} ${token.symbol} to ${destinationColumn.name}`);
                // TODO: Execute deposit transaction
            } else if (sourceColumn.type === 'protocol' && destinationColumn.type === 'wallet') {
                console.log(`💸 Withdrawing ${token.amount} ${token.symbol} from ${sourceColumn.name}`);
                // TODO: Execute withdrawal transaction
            } else if (sourceColumn.type === 'protocol' && destinationColumn.type === 'protocol') {
                console.log(`🔄 Moving ${token.amount} ${token.symbol} from ${sourceColumn.name} to ${destinationColumn.name}`);
                // TODO: Execute cross-protocol move (withdraw + deposit)
            }
        } catch (error) {
            console.error('Error executing liquidity move:', error);
            // TODO: Revert the UI change on error
        }
    };

    const formatValue = (value: number) => {
        if (value >= 1000) {
            return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
        } else {
            return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
    };

    const formatAmount = (amount: number, symbol: string) => {
        if (amount >= 1000) {
            return `${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })} ${symbol}`;
        } else {
            return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
        }
    };

    if (!isConnected) {
        return (
            <div className="text-center py-8">
                <Icon icon="solar:wallet-bold-duotone" className="mx-auto mb-4 text-gray-400" height={48} />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Connect Wallet</h3>
                <p className="text-gray-500 dark:text-gray-400">Connect your wallet to manage liquidity positions</p>
            </div>
        );
    }

    if (loading && !refreshing) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading your positions...</p>
            </div>
        );
    }

    return (
        <div className="liquidity-manager relative">
            {refreshing && (
                <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="text-gray-700 dark:text-gray-300">Refreshing data...</span>
                    </div>
                </div>
            )}
            <div className="mb-6 flex items-center justify-between">
                <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Liquidity Manager</h2>
                <p className="text-gray-600 dark:text-gray-400">Drag and drop tokens between your wallet and protocols</p>
                </div>
                                <div className="flex items-center gap-3">
                    {/* Confirm/Reset buttons when there are pending changes */}
                    {pendingChanges.length > 0 && (
                        <>
                            <button
                                onClick={handleResetChanges}
                                disabled={isProcessingTransaction}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                                title="Reset all changes"
                            >
                                <Icon icon="solar:refresh-circle-bold-duotone" className="h-5 w-5" />
                                Reset ({pendingChanges.length})
                            </button>
                            <button
                                onClick={handleConfirmChanges}
                                disabled={isProcessingTransaction}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
                                title="Confirm all changes"
                            >
                                <Icon 
                                    icon="solar:check-circle-bold-duotone" 
                                    className={`h-5 w-5 ${isProcessingTransaction ? 'animate-pulse' : ''}`} 
                                />
                                {isProcessingTransaction ? 'Confirming...' : `Confirm (${pendingChanges.length})`}
                            </button>
                        </>
                    )}
                    
                    {/* Refresh button */}
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing || isProcessingTransaction}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                        title="Refresh data"
                    >
                        <Icon 
                            icon="solar:refresh-bold-duotone" 
                            className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} 
                        />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
            </div>

            <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
                <div className="flex gap-1 items-stretch">
                    {/* Static Wallet Column - Always visible on the left */}
                    {(() => {
                        const walletColumn = columns.find(col => col.type === 'wallet');
                        if (!walletColumn) return null;

                        return (
                            <div className="flex-shrink-0">
                                <Droppable droppableId={walletColumn.id} key={walletColumn.id}>
                                    {(provided, snapshot) => (
                                        <div
                                        style={{
                                            margin: '2px 2px 2px 2px !important'
                                        }}
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`min-w-[280px] rounded-lg p-4 m-1 ${walletColumn.color} ${snapshot.isDraggingOver ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
                                                }`}
                                        >
                                            {/* Column Header */}
                                            <div className="flex items-center gap-3 mb-4">
                                                {walletColumn.icon && (
                                                    <Icon icon={walletColumn.icon} className="w-6 h-6 text-blue-600" />
                                                )}
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {walletColumn.name}
                                                </h3>
                                                <Badge color="blue" size="sm">
                                                    {walletColumn.tokens.length}
                                                </Badge>
                                            </div>

                                            {/* Column Total */}
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
                                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                                    {formatValue(walletColumn.tokens.reduce((sum, token) => sum + token.valueUSD, 0))}
                                                </p>
                                            </div>

                                            {/* Token Cards */}
                                            <div className="space-y-3">
                                                {walletColumn.tokens.map((token, index) => (
                                                    <Draggable key={token.id} draggableId={token.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`bg-white dark:bg-darkgray rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-600 cursor-grab hover:shadow-md transition-all ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <img
                                                                        src={token.icon}
                                                                        alt={token.symbol}
                                                                        className="w-8 h-8 rounded-full"
                                                                        onError={(e) => {
                                                                            // Fallback to TrustWallet ETH logo if the token icon fails
                                                                            e.currentTarget.src = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png';
                                                                        }}
                                                                    />
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center justify-between">
                                                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                                                {token.symbol}
                                                                            </h4>
                                                                        </div>
                                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                            {formatAmount(token.amount, token.symbol)}
                                                                        </p>
                                                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                            {formatValue(token.valueUSD)}
                                                                        </p>
                                                                    </div>
                                                                    <Icon
                                                                        icon="solar:maximize-bold-duotone"
                                                                        className="text-gray-400"
                                                                        height={16}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}

                                                {/* Empty State */}
                                                {walletColumn.tokens.length === 0 && (
                                                    <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                                                        <Icon icon="solar:inbox-line-bold-duotone" height={32} className="mx-auto mb-2" />
                                        <p className="text-sm">No tokens found</p>
                                        <p className="text-xs mt-1">Make sure your wallet has tokens with value</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        );
                    })()}

                    {/* Scrollable Protocol Columns */}
                    <div className="flex-1 min-w-0 self-stretch">
                        <SimpleBar>
                            <div className="flex gap-2 pb-4 items-stretch min-h-full">
                                {columns.filter(col => col.type === 'protocol').map((column) => (
                            <Droppable droppableId={column.id} key={column.id}>
                                {(provided, snapshot) => (
                                    <div
                                        style={{
                                            margin: '2px 2px 2px 2px !important'
                                        }}
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`min-w-[280px] min-h-full flex flex-col rounded-lg p-4 m-1 ${column.color} ${snapshot.isDraggingOver ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
                                            }`}
                                    >
                                        {/* Column Header */}
                                        <div className="flex items-center gap-3 mb-4">
                                            {column.icon && (
                                                <img
                                                    src={column.icon}
                                                    alt={column.name}
                                                    className="w-6 h-6 rounded-full"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            )}
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {column.name}
                                            </h3>
                                            <Badge color={column.type === 'wallet' ? 'blue' : 'green'} size="sm">
                                                {column.tokens.filter(t => !t.isSuggested).length}
                                            </Badge>
                                        </div>

                                        {/* Column Total */}
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
                                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                                {formatValue(column.tokens.filter(t => !t.isSuggested).reduce((sum, token) => sum + token.valueUSD, 0))}
                                            </p>
                                            {column.tokens.some(t => t.isSuggested) && (
                                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                    Drag tokens to earn up to {Math.max(...column.tokens.filter(t => t.isSuggested).map(t => t.apy || 0))}% APY
                                                </p>
                                            )}
                                        </div>

                                        {/* Token Cards */}
                                        <div className="space-y-3 flex-1">
                                            {column.tokens.map((token, index) => (
                                                <Draggable key={token.id} draggableId={token.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`bg-white dark:bg-darkgray rounded-lg p-3 m-1 shadow-sm border ${
                                                                token.isSuggested
                                                                    ? 'border-dashed border-2 border-blue-300 dark:border-blue-600 opacity-60 hover:opacity-80 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20'
                                                                    : 'border-gray-200 dark:border-gray-600 cursor-grab hover:shadow-md'
                                                            } transition-all ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''}`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <img
                                                                    src={token.icon}
                                                                    alt={token.symbol}
                                                                    className="w-8 h-8 rounded-full"
                                                                    onError={(e) => {
                                                                        // Fallback to TrustWallet ETH logo if the token icon fails
                                                                        e.currentTarget.src = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png';
                                                                    }}
                                                                />
                                                                <div className="flex-1">
                                                                    <div className="flex items-center justify-between">
                                                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                                                            {token.symbol}
                                                                        </h4>
                                                                        {token.apy && (
                                                                            <Badge color="success" size="xs">
                                                                                {token.apy}% APY
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                        {token.isSuggested ? "Available in wallet" : formatAmount(token.amount, token.symbol)}
                                                                    </p>
                                                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                        {token.isSuggested ? "Potential earnings →" : formatValue(token.valueUSD)}
                                                                    </p>
                                                                </div>
                                                                <Icon
                                                                    icon={token.isSuggested ? "solar:target-bold-duotone" : "solar:maximize-bold-duotone"}
                                                                    className={token.isSuggested ? "text-blue-400" : "text-gray-400"}
                                                                    height={16}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}

                                            {/* Empty State */}
                                            {column.tokens.filter(t => !t.isSuggested).length === 0 && (
                                                <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                                                    <Icon icon="solar:inbox-line-bold-duotone" height={32} className="mx-auto mb-2" />
                                                    <p className="text-sm">
                                                        {column.type === 'wallet' ? 'No tokens in wallet' : 'No positions in protocol'}
                                                    </p>
                                                    {column.type === 'protocol' && (
                                                        <p className="text-xs mt-2 text-gray-400">
                                                            Drag tokens to start earning
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                                ))}
                            </div>
                        </SimpleBar>
                    </div>
                </div>
            </DragDropContext>

            {/* Processing Transaction Overlay */}
            {isProcessingTransaction && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="text-gray-700 dark:text-gray-300">Processing transaction...</span>
                    </div>
                </div>
            )}

            {/* Transaction Success Notification */}
            {showTransactionSuccess && transactionHash && (
                <div className="fixed top-4 right-4 bg-green-100 dark:bg-green-800 border border-green-300 dark:border-green-600 rounded-lg p-4 shadow-xl z-50 max-w-md backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <Icon icon="solar:check-circle-bold-duotone" className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-green-900 dark:text-green-100">
                                Transaction Successful!
                            </h4>
                            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                                Your liquidity movements have been processed.
                            </p>
                            <div className="mt-2">
                                <p className="text-xs text-green-600 dark:text-green-400 font-mono">
                                    {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
                                </p>
                                <a
                                    href={`https://etherscan.io/tx/${transactionHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-1"
                                >
                                    <Icon icon="solar:external-link-bold-duotone" className="h-3 w-3" />
                                    View on Etherscan
                                </a>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setShowTransactionSuccess(false);
                                setTransactionHash(null);
                            }}
                            className="flex-shrink-0 text-green-400 hover:text-green-600"
                        >
                            <Icon icon="solar:close-circle-bold-duotone" className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiquidityManager;