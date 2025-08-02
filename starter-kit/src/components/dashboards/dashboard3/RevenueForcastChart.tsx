import CardBox from "../../shared/CardBox";
import { Icon } from "@iconify/react";
import {
    createColumnHelper,
    useReactTable,
    getCoreRowModel,
    flexRender,
} from "@tanstack/react-table";
import { Badge } from "flowbite-react";
import { useMemo } from "react";
import { getTokenMetadata } from "../../../utils/tokenMappings";

export interface TableTypeRowSelection {
    logo?: string;
    protocol?: string;
    chain?: string;
    protocolIcon?: string;
    tokens: {
        id: string;
        symbol: string;
        color: string;
        icon: string;
    }[];
    apy?: string;
    supplied?: string;
    currentValue?: string;
    claimableInterest?: string;
    status?: string;
    statuscolor?: string;
    selection?: any;
}

interface ProtocolBreakdown {
    supplied: number;
    interest: number;
    [key: string]: any;
}

interface RevenueForcastChartProps {
    protocolBreakdowns: Record<string, ProtocolBreakdown>;
}

// Protocol configuration for display
const protocolsConfig = [
    {
        name: "Pendle",
        icon: "solar:chart-2-bold-duotone",
        logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x808507121B80c02388fAd14726482e061B8da827/logo.png",
        chain: "Ethereum",
        color: "primary"
    },
    {
        name: "Aave",
        icon: "solar:recive-twice-square-linear",
        logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9/logo.png",
        chain: "Ethereum",
        color: "warning"
    },
    {
        name: "Curve",
        icon: "ic:outline-backpack",
        logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xD533a949740bb3306d119CC777fa900bA034cd52/logo.png",
        chain: "Ethereum",
        color: "secondary"
    },
    {
        name: "Spark",
        icon: "solar:flame-linear",
        logo: "https://asset-metadata-service-production.s3.amazonaws.com/asset_icons/eec087023aa976ee9fe4aa05b54d35d918c9a45c7770000f5745ea6ce14adaf1.png",
        chain: "Ethereum",
        color: "error"
    },
    {
        name: "Uniswap",
        icon: "ic:outline-forest",
        logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png",
        chain: "Ethereum",
        color: "success"
    },
    {
        name: "1inch",
        icon: "cryptocurrency:1inch",
        logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x111111111117dC0aa78b770fA6A738034120C302/logo.png",
        chain: "Ethereum",
        color: "info"
    }
];

// Helper function to deduplicate tokens by symbol
const deduplicateTokens = (tokens: any[]) => {
    return tokens.reduce((acc: any[], token: any) => {
        const existingToken = acc.find(t => t.symbol.toLowerCase() === token.symbol.toLowerCase());
        if (!existingToken) {
            acc.push(token);
        }
        return acc;
    }, []);
};

// Get tokens with proper metadata and icons
const getTokensForProtocol = (protocolKey: string) => {
    const createToken = (symbol: string, id: string, color: string = "primary") => {
        const metadata = getTokenMetadata(symbol);
        return {
            id,
            symbol,
            color,
            icon: metadata.icon || `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x${symbol.toLowerCase()}/logo.png`
        };
    };

    switch (protocolKey.toLowerCase()) {
        case 'uniswap':
            return [
                createToken("WETH", "1", "secondary"),
                createToken("DAI", "2", "primary")
            ];
        case 'spark':
            return [
                createToken("USDS", "1", "primary"),
                createToken("ETH", "2", "secondary")
            ];
        case 'aave':
            return [
                createToken("USDC", "1", "primary"),
                createToken("DAI", "2", "success")
            ];
        case 'curve':
            return [
                createToken("USDT", "1", "primary"),
                createToken("USDC", "2", "primary")
            ];
        case 'oneinch':
            return [
                createToken("USDC", "1", "primary"),
                createToken("ETH", "2", "secondary")
            ];
        default:
            return [
                createToken("USDS", "1", "primary"),
                createToken("ETH", "2", "secondary")
            ];
    }
};

const transformProtocolData = (
    protocolBreakdowns: Record<string, ProtocolBreakdown>
): TableTypeRowSelection[] => {
    if (!protocolBreakdowns || Object.keys(protocolBreakdowns).length === 0) {
        return [];
    }

    const tableData: TableTypeRowSelection[] = [];

    Object.entries(protocolBreakdowns).forEach(([key, breakdown]) => {
        if (breakdown.supplied > 0 || breakdown.interest > 0) {
            const protocolName = key.charAt(0).toUpperCase() + key.slice(1);
            const displayName = key === 'oneInch' ? '1inch' : protocolName;

            const config = protocolsConfig.find(p =>
                p.name.toLowerCase().includes(key.toLowerCase()) ||
                (key === 'oneInch' && p.name.toLowerCase().includes('1inch'))
            );

            if (config) {
                // Use actual token data from breakdown if available, otherwise use default tokens
                let protocolTokens;
                if (breakdown.tokens && breakdown.tokens.length > 0) {
                    // Deduplicate tokens based on symbol
                    const uniqueTokens = deduplicateTokens(breakdown.tokens);

                    protocolTokens = uniqueTokens.map((token: any, index: number) => ({
                        id: (index + 1).toString(),
                        symbol: token.symbol,
                        color: token.isStablecoin ? "primary" : "secondary",
                        icon: token.icon || getTokenMetadata(token.symbol).icon || ''
                    }));
                } else {
                    protocolTokens = getTokensForProtocol(key);
                }

                // Apply deduplication to the final result as well
                protocolTokens = deduplicateTokens(protocolTokens);

                tableData.push({
                    logo: config.logo,
                    protocol: displayName === 'Uniswap' ? 'Uniswap V4' : displayName,
                    chain: config.chain,
                    protocolIcon: config.icon,
                    tokens: protocolTokens,
                    apy: (() => {
                        // Use actual APY from token data if available
                        if (breakdown.tokens && breakdown.tokens.length > 0) {
                            const tokenAPYs = breakdown.tokens
                                .map((token: any) => parseFloat(token.apy))
                                .filter((apy: number) => !isNaN(apy) && apy > 0);

                            if (tokenAPYs.length > 0) {
                                const averageAPY = tokenAPYs.reduce((sum: number, apy: number) => sum + apy, 0) / tokenAPYs.length;
                                return `${averageAPY.toFixed(1)}%`;
                            }
                        }

                        // Fallback to calculated APY
                        return breakdown.supplied > 0 ?
                            `${((breakdown.interest / breakdown.supplied) * 100).toFixed(1)}%` : '0.0%';
                    })(),
                    supplied: breakdown.supplied < 100 ?
                        `$${breakdown.supplied.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` :
                        `$${breakdown.supplied.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
                    claimableInterest: breakdown.interest < 100 ?
                        `$${breakdown.interest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` :
                        `$${breakdown.interest.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
                    status: breakdown.interest > 0 ? "Active" : "No Profit",
                    statuscolor: breakdown.interest > 0 ? "success" : "warning"
                });
            }
        }
    });

    return tableData;
};

const columnHelper = createColumnHelper<TableTypeRowSelection>();

const columns = [
    columnHelper.display({
        header: ({ table }) => (
            <input
                type="checkbox"
                checked={table.getIsAllRowsSelected()}
                onChange={table.getToggleAllRowsSelectedHandler()}
                className=" h-[18px] w-[18px] border border-border dark:border-darkborder bg-white dark:bg-transparent !data-[checked]:bg-primary dark:data-[checked]:bg-primary rounded cursor-pointer focus:ring-0 focus:ring-offset-0 outline-none"
            />
        ),
        cell: ({ row }) => (
            <input
                type="checkbox"
                checked={row.getIsSelected()}
                onChange={row.getToggleSelectedHandler()}
                className=" h-[18px] w-[18px] border border-border dark:border-darkborder bg-white dark:bg-transparent !data-[checked]:bg-primary dark:data-[checked]:bg-primary rounded cursor-pointer focus:ring-0 focus:ring-offset-0 outline-none"
            />
        ),
        id: "selection",
    }),
    columnHelper.accessor("logo", {
        cell: (info) => (
            <div className="flex items-center space-x-3 p-1">
                <div className="h-10 w-10 flex items-center justify-center bg-white dark:bg-dark p-1" style={{ borderRadius: '20px' }}>
                    <img
                        src={info.getValue()}
                        alt={info.row.original.protocol}
                        className="object-contain"
                        style={{ height: '32px', borderRadius: '20px' }}
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const iconFallback = target.nextSibling as HTMLElement;
                            if (iconFallback) iconFallback.style.display = 'flex';
                        }}
                    />
                    <div className="hidden items-center justify-center bg-gray-200 dark:bg-gray-700" style={{ height: '32px', width: '32px', borderRadius: '20px' }}>
                        {info.row.original.protocolIcon ? (
                            <Icon
                                icon={info.row.original.protocolIcon}
                                className="text-lg"
                                style={{ color: '#666' }}
                            />
                        ) : (
                            <span className="text-xs font-medium">
                                {info.row.original.protocol?.charAt(0)}
                            </span>
                        )}
                    </div>
                </div>
                <div className="truncate max-w-32">
                    <h6 className="text-sm font-medium">{info.row.original.protocol}</h6>
                    <p className="text-xs text-gray-500">{info.row.original.chain}</p>
                </div>
            </div>
        ),
        header: () => <span>Protocol</span>,
    }),
    columnHelper.accessor("tokens", {
        header: () => <span>Tokens</span>,
        cell: (info) => (
            <div className="flex">
                {info.getValue().map((token) => (
                    <div className="-ms-2" key={token.id} title={token.symbol}>
                        <div className="h-8 w-8 border-2 border-white dark:border-darkborder bg-white dark:bg-dark flex justify-center items-center p-1" style={{ borderRadius: '20px' }}>
                            <img
                                src={token.icon}
                                alt={token.symbol}
                                className="object-contain"
                                style={{ height: '28px', borderRadius: '20px' }}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const sibling = target.nextSibling as HTMLElement;
                                    if (sibling) sibling.style.display = 'flex';
                                }}
                            />
                            <div
                                className={`hidden items-center justify-center bg-${token.color} text-white text-xs font-medium`}
                                style={{ height: '28px', width: '28px', borderRadius: '20px' }}
                            >
                                {token.symbol.charAt(0)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ),
    }),
    columnHelper.accessor("apy", {
        header: () => <span>APY</span>,
        cell: (info) => (
            <span className="text-base font-semibold text-green-600 dark:text-green-400">
                {info.getValue()}
            </span>
        ),
    }),
    columnHelper.accessor("supplied", {
        header: () => <span>Supplied</span>,
        cell: (info) => (
            <span className="text-base font-semibold">
                {info.getValue()}
            </span>
        ),
    }),
    columnHelper.accessor("claimableInterest", {
        header: () => <span>Claimable Interest</span>,
        cell: (info) => (
            <span className="text-base font-semibold text-blue-600 dark:text-blue-400">
                {info.getValue()}
            </span>
        ),
    }),
    columnHelper.accessor("status", {
        header: () => <span>Status</span>,
        cell: (info) => (
            <Badge color={info.row.original.statuscolor as any} className="font-medium">
                {info.getValue()}
            </Badge>
        ),
    }),
];

const RevenueForcastChart = ({ protocolBreakdowns }: RevenueForcastChartProps) => {
    // Transform the prop data into table format
    const data = useMemo(() => transformProtocolData(protocolBreakdowns), [protocolBreakdowns]);

    // Calculate totals from data
    const totals = useMemo(() => {
        return data.reduce((acc, row) => {
            const supplied = parseFloat(row.supplied?.replace(/[$,]/g, '') || '0');
            const claimable = parseFloat(row.claimableInterest?.replace(/[$,]/g, '') || '0');
            return {
                totalSupplied: acc.totalSupplied + supplied,
                totalClaimable: acc.totalClaimable + claimable
            };
        }, { totalSupplied: 0, totalClaimable: 0 });
    }, [data]);

    // Calculate average APY
    const avgAPY = useMemo(() => {
        return data.length > 0
            ? (data.reduce((acc, row) => acc + parseFloat(row.apy?.replace('%', '') || '0'), 0) / data.length).toFixed(1)
            : '0.0';
    }, [data]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        enableRowSelection: true,
    });

    // Show empty state if no data
    if (!data || data.length === 0) {
        return (
            <CardBox>
                <div className="text-center py-12">
                    <Icon icon="solar:chart-square-linear" className="mx-auto mb-4 text-gray-400" height={48} />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Protocol Data</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Protocol breakdown data is required to display the revenue forecast chart.
                    </p>
                </div>
            </CardBox>
        );
    }

    return (
        <>
            <br></br>
            <CardBox>


                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th key={header.id} className="text-left py-3 px-2 font-medium text-sm">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map((row) => (
                                <tr key={row.id} className="border-t border-gray-100 dark:border-gray-700">
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="py-3 px-2">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex md:flex-row flex-col gap-3 mt-6">
                    <div className="md:basis-1/3 basis-full">
                        <div className="flex gap-3 items-center">
                            <span className="h-12 w-12 flex-shrink-0 flex items-center justify-center bg-muted dark:bg-dark rounded-tw">
                                <Icon
                                    icon="solar:pie-chart-2-linear"
                                    className="text-ld"
                                    height={24}
                                />
                            </span>
                            <div>
                                <p>Total Supplied</p>
                                <h5 className="font-medium text-lg">${totals.totalSupplied.toLocaleString()}</h5>
                            </div>
                        </div>
                    </div>
                    <div className="md:basis-1/3 basis-full">
                        <div className="flex gap-3 items-center">
                            <span className="h-12 w-12 flex-shrink-0 flex items-center justify-center bg-lightprimary rounded-tw">
                                <Icon
                                    icon="solar:hand-money-linear"
                                    className="text-primary"
                                    height={24}
                                />
                            </span>
                            <div>
                                <p>Claimable Interest</p>
                                <h5 className="font-medium text-lg">${totals.totalClaimable.toLocaleString()}</h5>
                            </div>
                        </div>
                    </div>
                    <div className="md:basis-1/3 basis-full">
                        <div className="flex gap-3 items-center">
                            <span className="h-12 w-12 flex-shrink-0 flex items-center justify-center bg-lightsuccess rounded-tw">
                                <Icon
                                    icon="solar:percentage-circle-linear"
                                    className="text-success"
                                    height={24}
                                />
                            </span>
                            <div>
                                <p>Avg APY</p>
                                <h5 className="font-medium text-lg">{avgAPY}%</h5>
                            </div>
                        </div>
                    </div>
                </div>
            </CardBox>
        </>
    );
};

export default RevenueForcastChart;