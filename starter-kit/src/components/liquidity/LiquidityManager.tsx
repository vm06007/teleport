import React, { useContext, useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import SimpleBar from 'simplebar-react';
import { Icon } from '@iconify/react';
import { Badge, Button, Tooltip } from 'flowbite-react';
import { useWallet } from 'src/hooks/useWallet';

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

const LiquidityManager = () => {
    const { account, isConnected } = useWallet();
    const [columns, setColumns] = useState<LiquidityColumn[]>([]);
    const [loading, setLoading] = useState(false);

    // Initialize columns with wallet and protocols
    const initializeColumns = async () => {
        if (!account) return;

        setLoading(true);
        try {
            // TODO: Fetch real wallet balances and protocol positions
            const initialColumns: LiquidityColumn[] = [
                {
                    id: 'wallet',
                    name: 'Wallet',
                    type: 'wallet',
                    icon: 'solar:wallet-bold-duotone',
                    color: 'bg-blue-50 dark:bg-blue-900/20',
                    tokens: [
                        {
                            id: 'eth-wallet',
                            symbol: 'ETH',
                            name: 'Ethereum',
                            amount: 2.5,
                            valueUSD: 9183.50,
                            icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
                            decimals: 18,
                            address: '0x0000000000000000000000000000000000000000'
                        },
                        {
                            id: 'usdc-wallet',
                            symbol: 'USDC',
                            name: 'USD Coin',
                            amount: 15000,
                            valueUSD: 15000,
                            icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
                            decimals: 6,
                            address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
                        },
                        {
                            id: 'dai-wallet',
                            symbol: 'DAI',
                            name: 'Dai Stablecoin',
                            amount: 8500,
                            valueUSD: 8500,
                            icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
                            decimals: 18,
                            address: '0x6B175474E89094C44Da98b954EedeAC495271d0F'
                        },
                    ]
                },
                {
                    id: 'aave',
                    name: 'Aave',
                    type: 'protocol',
                    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9/logo.png',
                    color: 'bg-purple-50 dark:bg-purple-900/20',
                    tokens: [],
                    protocolAddress: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9'
                },
                {
                    id: 'spark',
                    name: 'Spark',
                    type: 'protocol',
                    icon: 'https://asset-metadata-service-production.s3.amazonaws.com/asset_icons/eec087023aa976ee9fe4aa05b54d35d918c9a45c7770000f5745ea6ce14adaf1.png',
                    color: 'bg-pink-50 dark:bg-pink-900/20',
                    tokens: [
                        {
                            id: 'dai-spark',
                            symbol: 'DAI',
                            name: 'DAI Stablecoin',
                            amount: 50000,
                            valueUSD: 49880,
                            icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdc035d45d973e3ec169d2276ddab16f1e407384f/logo.png',
                            decimals: 18,
                            address: '0xdc035d45d973e3ec169d2276ddab16f1e407384f',
                            apy: 3.2
                        }
                    ],
                    protocolAddress: '0x173e314c7635b45322cd8cb14f44b312e079f3af'
                },
                {
                    id: 'uniswap',
                    name: 'Uniswap V4',
                    type: 'protocol',
                    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png',
                    color: 'bg-green-50 dark:bg-green-900/20',
                    tokens: [
                        {
                            id: 'eth-wise-lp',
                            symbol: 'ETH/WISE',
                            name: 'ETH/WISE LP',
                            amount: 1,
                            valueUSD: 18534,
                            icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
                            decimals: 18,
                            address: '0xbd216513d74c8cf14cf4747e6aaa6420ff64ee9e',
                            apy: 0.0
                        }
                    ],
                    protocolAddress: '0xbd216513d74c8cf14cf4747e6aaa6420ff64ee9e'
                },
                {
                    id: 'curve',
                    name: 'Curve',
                    type: 'protocol',
                    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xD533a949740bb3306d119CC777fa900bA034cd52/logo.png',
                    color: 'bg-yellow-50 dark:bg-yellow-900/20',
                    tokens: [],
                    protocolAddress: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7'
                },
                {
                    id: 'pendle',
                    name: 'Pendle',
                    type: 'protocol',
                    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x808507121B80c02388fAd14726482e061B8da827/logo.png',
                    color: 'bg-orange-50 dark:bg-orange-900/20',
                    tokens: [],
                    protocolAddress: '0x0000000000000000000000000000000000000000'
                }
            ];

            setColumns(initialColumns);
        } catch (error) {
            console.error('Error initializing liquidity columns:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (account && isConnected) {
            initializeColumns();
        }
    }, [account, isConnected]);

    // Handle drag and drop
    const onDragEnd = (result: any) => {
        const { source, destination, draggableId } = result;

        if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
            return;
        }

        const sourceColumnId = source.droppableId;
        const destinationColumnId = destination.droppableId;

        console.log(`🔄 Moving token ${draggableId} from ${sourceColumnId} to ${destinationColumnId}`);

        // Create new columns state with the moved token
        setColumns(prevColumns => {
            const newColumns = [...prevColumns];
            const sourceColumn = newColumns.find(col => col.id === sourceColumnId);
            const destinationColumn = newColumns.find(col => col.id === destinationColumnId);

            if (!sourceColumn || !destinationColumn) return prevColumns;

            // Remove token from source
            const tokenToMove = sourceColumn.tokens[source.index];
            sourceColumn.tokens.splice(source.index, 1);

            // Add token to destination
            destinationColumn.tokens.splice(destination.index, 0, tokenToMove);

            // TODO: Execute actual blockchain transaction here
            handleLiquidityMove(tokenToMove, sourceColumn, destinationColumn);

            return newColumns;
        });
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

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading your positions...</p>
            </div>
        );
    }

    return (
        <div className="liquidity-manager">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Liquidity Management</h2>
                <p className="text-gray-600 dark:text-gray-400">Drag and drop tokens between your wallet and protocols</p>
            </div>

            <SimpleBar>
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex gap-6 overflow-x-auto pb-4">
                        {columns.map((column) => (
                            <Droppable droppableId={column.id} key={column.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`min-w-[280px] rounded-lg p-4 ${column.color} ${snapshot.isDraggingOver ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
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
                                                {column.tokens.length}
                                            </Badge>
                                        </div>

                                        {/* Column Total */}
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
                                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                                {formatValue(column.tokens.reduce((sum, token) => sum + token.valueUSD, 0))}
                                            </p>
                                        </div>

                                        {/* Token Cards */}
                                        <div className="space-y-3">
                                            {column.tokens.map((token, index) => (
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
                                                                        e.currentTarget.src = ``;
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
                                            {column.tokens.length === 0 && (
                                                <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                                                    <Icon icon="solar:inbox-line-bold-duotone" height={32} className="mx-auto mb-2" />
                                                    <p className="text-sm">
                                                        {column.type === 'wallet' ? 'No tokens in wallet' : 'No positions in protocol'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                        ))}
                    </div>
                </DragDropContext>
            </SimpleBar>
        </div>
    );
};

export default LiquidityManager;