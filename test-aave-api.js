import { fetchAavePositions, calculateActualBalances } from './src/services/aaveService.js';

const TEST_ADDRESS = '0x641AD78BAca220C5BD28b51Ce8e0F495e85Fe689';
const CHAIN_ID = 1; // Ethereum mainnet

async function testAaveService() {
    console.log('Testing Aave service with address:', TEST_ADDRESS);
    console.log('Chain ID:', CHAIN_ID);
    
    try {
        // Fetch Aave positions
        const positions = await fetchAavePositions(TEST_ADDRESS, CHAIN_ID);
        console.log('\nRaw Aave positions:', positions);
        
        if (positions.length > 0) {
            // Calculate actual balances
            const calculatedPositions = await calculateActualBalances(positions, CHAIN_ID);
            console.log('\nCalculated positions:', calculatedPositions);
            
            // Show summary
            const totalSupply = calculatedPositions.reduce((sum, pos) => sum + (pos.supplyValue || 0), 0);
            const totalDebt = calculatedPositions.reduce((sum, pos) => sum + (pos.debtValue || 0), 0);
            const netValue = totalSupply - totalDebt;
            
            console.log('\n=== Aave Portfolio Summary ===');
            console.log('Total Supply Value: $', totalSupply.toFixed(2));
            console.log('Total Debt Value: $', totalDebt.toFixed(2));
            console.log('Net Value: $', netValue.toFixed(2));
            console.log('Number of positions:', positions.length);
            
            // Show individual positions
            console.log('\n=== Individual Positions ===');
            calculatedPositions.forEach((pos, index) => {
                console.log(`${index + 1}. ${pos.symbol} (${pos.protocol})`);
                console.log(`   Supply: ${pos.supplyBalance.toFixed(4)} ${pos.symbol} ($${pos.supplyValue.toFixed(2)})`);
                console.log(`   Debt: ${pos.variableDebt.toFixed(4)} + ${pos.stableDebt.toFixed(4)} = ${(pos.variableDebt + pos.stableDebt).toFixed(4)} ${pos.symbol} ($${pos.debtValue.toFixed(2)})`);
                console.log(`   Net: $${pos.netValue.toFixed(2)}`);
                console.log(`   Collateral: ${pos.usageAsCollateral ? 'Yes' : 'No'}`);
                console.log('');
            });
        } else {
            console.log('No Aave positions found for this address');
        }
        
    } catch (error) {
        console.error('Error testing Aave service:', error);
    }
}

testAaveService(); 