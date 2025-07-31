
import CardBox from "../../shared/CardBox";
import { Icon } from "@iconify/react";
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Badge } from "flowbite-react";
import React from "react";

export interface TableTypeRowSelection {
  logo?: string;
  protocol?: string;
  chain?: string;
  tokens: {
    id: string;
    symbol: string;
    color: string;
    icon: string;
  }[];
  apy?: string;
  supplied?: string;
  claimableInterest?: string;
  status?: string;
  statuscolor?: string;
  selection?: any;
}

const basicTableData: TableTypeRowSelection[] = [
  {
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/dapps/aave.png",
    protocol: "Aave",
    chain: "Ethereum",
    tokens: [
      {
        id: "1",
        symbol: "USDC",
        color: "primary",
        icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
      },
      {
        id: "2",
        symbol: "ETH",
        color: "secondary",
        icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
      },
    ],
    apy: "4.2%",
    supplied: "$15,250",
    claimableInterest: "$64.05",
    status: "Active",
    statuscolor: "success",
  },
  {
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xc00e94Cb662C3520282E6f5717214004A7f26888/logo.png",
    protocol: "Compound",
    chain: "Ethereum",
    tokens: [
      {
        id: "1",
        symbol: "DAI",
        color: "warning",
        icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png",
      },
      {
        id: "2",
        symbol: "USDC",
        color: "primary",
        icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
      },
      {
        id: "3",
        symbol: "USDT",
        color: "success",
        icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
      },
    ],
    apy: "3.8%",
    supplied: "$8,750",
    claimableInterest: "$33.25",
    status: "Active",
    statuscolor: "success",
  },
  {
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png",
    protocol: "Uniswap V3",
    chain: "Polygon",
    tokens: [
      {
        id: "1",
        symbol: "USDT",
        color: "success",
        icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
      },
      {
        id: "2",
        symbol: "USDC",
        color: "primary",
        icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
      },
    ],
    apy: "12.5%",
    supplied: "$5,500",
    claimableInterest: "$68.75",
    status: "Active",
    statuscolor: "success",
  },
  {
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xD533a949740bb3306d119CC777fa900bA034cd52/logo.png",
    protocol: "Curve",
    chain: "Arbitrum",
    tokens: [
      {
        id: "1",
        symbol: "3CRV",
        color: "error",
        icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xD533a949740bb3306d119CC777fa900bA034cd52/logo.png",
      },
    ],
    apy: "7.3%",
    supplied: "$12,000",
    claimableInterest: "$87.60",
    status: "Pending",
    statuscolor: "warning",
  },
  {
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e/logo.png",
    protocol: "Yearn",
    chain: "Ethereum",
    tokens: [
      {
        id: "1",
        symbol: "yUSDC",
        color: "primary",
        icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
      },
      {
        id: "2",
        symbol: "yETH",
        color: "secondary",
        icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
      },
    ],
    apy: "5.9%",
    supplied: "$20,000",
    claimableInterest: "$118.00",
    status: "Active",
    statuscolor: "success",
  },
];

const columnHelper = createColumnHelper<TableTypeRowSelection>();

const columns = [
  columnHelper.accessor("selection", {
    header: ({ table }) => {
      const ref = React.useRef<HTMLInputElement>(null);

      React.useEffect(() => {
        if (ref.current) {
          ref.current.indeterminate = table.getIsSomeRowsSelected();
        }
      }, [table.getIsSomeRowsSelected()]);

      return (
        <input
          type="checkbox"
          ref={ref}
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          className=" h-[18px] w-[18px] border border-border dark:border-darkborder bg-white dark:bg-transparent !data-[checked]:bg-primary dark:data-[checked]:bg-primary rounded cursor-pointer focus:ring-0 focus:ring-offset-0 outline-none"
        />
      );
    },
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
              const sibling = target.nextSibling as HTMLElement;
              if (sibling) sibling.style.display = 'flex';
            }}
          />
          <div className="hidden items-center justify-center bg-gray-200 dark:bg-gray-700 text-xs font-medium" style={{ height: '32px', width: '32px', borderRadius: '20px' }}>
            {info.row.original.protocol?.charAt(0)}
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
    cell: (info) => <p className="text-base">{info.getValue()}</p>,
  }),
  columnHelper.accessor("claimableInterest", {
    header: () => <span>Interest</span>,
    cell: (info) => (
      <span className="text-base font-semibold text-blue-600 dark:text-blue-400">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("status", {
    header: () => <span>Status</span>,
    cell: (info) => (
      <Badge
        color={`light${info.row.original.statuscolor}`}
        className="capitalize"
      >
        {info.getValue()}
      </Badge>
    ),
  }),
];
const RevenueForcastChart = () => {
  const [data] = React.useState(basicTableData);
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  });

  return (
    <>
      <CardBox>
        <div className="md:flex justify-between items-center">
          <div>
            <h5 className="card-title">Claimable Interest</h5>
          </div>
        </div>
        <div className="border border-ld rounded-md overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className={`text-base text-ld font-semibold text-left border-b border-ld p-2`}
                      >
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
              <tbody className="divide-y divide-border dark:divide-darkborder">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={`whitespace-nowrap text-sm p-2`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex md:flex-row flex-col gap-3">
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
                <p>Total</p>
                <h5 className="font-medium text-lg">$96,640</h5>
              </div>
            </div>
          </div>
          <div className="md:basis-1/3 basis-full">
            <div className="flex gap-3 items-center">
              <span className="h-12 w-12 flex-shrink-0 flex items-center justify-center bg-lightprimary rounded-tw">
                <Icon
                  icon="solar:dollar-minimalistic-linear"
                  className="text-primary"
                  height={24}
                />
              </span>
              <div>
                <p>Profit</p>
                <h5 className="font-medium text-lg">$48,820</h5>
              </div>
            </div>
          </div>
          <div className="md:basis-1/3 basis-full">
            <div className="flex gap-3 items-center">
              <span className="h-12 w-12 flex-shrink-0 flex items-center justify-center bg-lighterror rounded-tw">
                <Icon
                  icon="solar:database-linear"
                  className="text-error"
                  height={24}
                />
              </span>
              <div>
                <p>Earnings</p>
                <h5 className="font-medium text-lg">$48,820</h5>
              </div>
            </div>
          </div>
        </div>
      </CardBox>
</>
  );
};

export default RevenueForcastChart;
