/* eslint-disable @next/next/no-img-element */
import { BigNumber } from "ethers";
import { useRouter } from "next/router";
import numeral from "numeral";
import React, { useEffect, useState } from "react";
import { FaSortDown, FaSortUp } from "react-icons/fa";
import { useAppContext } from "../../../context/AppContext";
import { KashiPairsByToken } from "../../../types/KashiPair";

type OrderBy = "symbol" | "totalSupply" | "totalAsset" | "totalBorrow" | "";
type OrderDirection = "asc" | "desc";

const MarketTableHead = ({
  onSort,
  orderBy,
  orderDirection,
}: {
  onSort: (orderBy: OrderBy) => void;
  orderBy: OrderBy;
  orderDirection: OrderDirection;
}) => {
  const iconByDirection = {
    asc: <FaSortUp className="inline-block" />,
    desc: <FaSortDown className="inline-block" />,
  };

  return (
    <tr className="text-sm border-t text-slate-400">
      <td
        className="py-2 pl-8 pr-2 cursor-pointer"
        onClick={() => {
          onSort("symbol");
        }}
      >
        Token {orderBy === "symbol" && iconByDirection[orderDirection]}
      </td>
      <td
        className="p-2 text-right"
        onClick={() => {
          onSort("totalSupply");
        }}
      >
        <span className="cursor-pointer">
          Total Supply
          {orderBy === "totalSupply" && iconByDirection[orderDirection]}
        </span>
      </td>
      <td
        className="p-2 text-right"
        onClick={() => {
          onSort("totalAsset");
        }}
      >
        <span className="cursor-pointer">
          Total Available
          {orderBy === "totalAsset" && iconByDirection[orderDirection]}
        </span>
      </td>
      <td
        className="py-2 pl-2 pr-8 text-right"
        onClick={() => {
          onSort("totalBorrow");
        }}
      >
        <span className="cursor-pointer">
          Total Borrow
          {orderBy === "totalBorrow" && iconByDirection[orderDirection]}
        </span>
      </td>
    </tr>
  );
};

const MarketTableRowLoading = () => (
  <tr className="border-t border-l-2 border-transparent cursor-pointer border-t-gray-200 hover:border-l-primary1-400">
    <td className="py-3 pl-8 pr-2">
      <div className="flex items-center">
        <div>
          <div className="inline-block w-8 h-8 rounded-full loading"></div>
        </div>
        <div className="ml-2">
          <div>
            <div className="inline-block w-24 h-5 rounded loading"></div>
          </div>
        </div>
      </div>
    </td>
    <td className="px-2 py-3 text-right">
      <div>
        <div className="inline-block w-32 h-5 rounded loading"></div>
      </div>
      <div>
        <div className="inline-block h-4 rounded loading w-28"></div>
      </div>
    </td>
    <td className="px-2 py-3 text-right">
      <div>
        <div className="inline-block w-32 h-5 rounded loading"></div>
      </div>
      <div>
        <div className="inline-block h-4 rounded loading w-28"></div>
      </div>
    </td>
    <td className="py-3 pl-2 pr-8 text-right">
      <div>
        <div className="inline-block w-32 h-5 rounded loading"></div>
      </div>
      <div>
        <div className="inline-block h-4 rounded loading w-28"></div>
      </div>
    </td>
  </tr>
);

const MarketTableRow = ({
  data,
  index,
}: {
  data: KashiPairsByToken;
  index: number;
}) => {
  const { tokenUtilService, handleLogoError } = useAppContext();
  const router = useRouter();
  const goto = (route: string) => {
    router.push(route);
  };

  return (
    <tr
      onClick={() => goto(`/token/${data.token.id}`)}
      className="border-t border-l-2 border-transparent cursor-pointer border-t-gray-200 hover:border-l-primary1-400"
    >
      <td className="py-3 pl-8 pr-2">
        <div className="flex items-center">
          <img
            src={tokenUtilService.logo(data.token.symbol)}
            className="inline-block w-8 h-8 rounded-full min-w-fit min-h-fit"
            onError={handleLogoError}
            alt={data.token.symbol}
          />
          <div className="ml-2">
            <div>{tokenUtilService.symbol(data.token.symbol)}</div>
          </div>
        </div>
      </td>
      <td className="px-2 py-3 text-right">
        {numeral(
          BigNumber.from(data.totalAsset)
            .add(BigNumber.from(data.totalBorrow))
            .toNumber() / 100
        ).format("$0,.00")}
      </td>
      <td className="px-2 py-3 text-right">
        {numeral(BigNumber.from(data.totalAsset).toNumber() / 100).format(
          "$0,.00"
        )}
      </td>
      <td className="py-3 pl-2 pr-8 text-right">
        {numeral(BigNumber.from(data.totalBorrow).toNumber() / 100).format(
          "$0,.00"
        )}
      </td>
    </tr>
  );
};

const TokenMarketTable = ({
  title = "All Tokens",
  loading = false,
  data = [],
}: {
  title?: string;
  loading?: boolean;
  data: KashiPairsByToken[];
}) => {
  const [orderBy, setOrderBy] = useState<OrderBy>("");
  const [orderDirection, setOrderDirection] = useState<OrderDirection>("desc");

  const [fullList, setFullList] = useState<KashiPairsByToken[]>([]);
  const [sortedList, setSortedList] = useState<KashiPairsByToken[]>([]);
  const [list, setList] = useState<KashiPairsByToken[]>([]);
  const [isMore, setMore] = useState(false);

  useEffect(() => {
    setFullList(data);
  }, [data]);

  useEffect(() => {
    let newSortedList = [...fullList];
    const compareFuncs = {
      symbol: {
        asc: (a: KashiPairsByToken, b: KashiPairsByToken) =>
          (a.token.symbol.toLowerCase() || "").localeCompare(
            b.token.symbol.toLowerCase() || ""
          ),
        desc: (a: KashiPairsByToken, b: KashiPairsByToken) =>
          (b.token.symbol.toLowerCase() || "").localeCompare(
            a.token.symbol.toLowerCase() || ""
          ),
      },
      totalSupply: {
        asc: (a: KashiPairsByToken, b: KashiPairsByToken) =>
          BigNumber.from(a.totalAsset)
            .add(BigNumber.from(a.totalBorrow))
            .lte(
              BigNumber.from(b.totalAsset).add(BigNumber.from(b.totalBorrow))
            )
            ? -1
            : 1,
        desc: (a: KashiPairsByToken, b: KashiPairsByToken) =>
          BigNumber.from(a.totalAsset)
            .add(BigNumber.from(a.totalBorrow))
            .gte(
              BigNumber.from(b.totalAsset).add(BigNumber.from(b.totalBorrow))
            )
            ? -1
            : 1,
      },
      totalAsset: {
        asc: (a: KashiPairsByToken, b: KashiPairsByToken) =>
          BigNumber.from(a.totalAsset).lte(BigNumber.from(b.totalAsset))
            ? -1
            : 1,
        desc: (a: KashiPairsByToken, b: KashiPairsByToken) =>
          BigNumber.from(a.totalAsset).gte(BigNumber.from(b.totalAsset))
            ? -1
            : 1,
      },
      totalBorrow: {
        asc: (a: KashiPairsByToken, b: KashiPairsByToken) =>
          BigNumber.from(a.totalBorrow).lte(BigNumber.from(b.totalBorrow))
            ? -1
            : 1,
        desc: (a: KashiPairsByToken, b: KashiPairsByToken) =>
          BigNumber.from(a.totalBorrow).gte(BigNumber.from(b.totalBorrow))
            ? -1
            : 1,
      },
    };

    if (orderBy) {
      newSortedList.sort(compareFuncs[orderBy][orderDirection]);
    }
    setSortedList(newSortedList);
  }, [fullList, orderBy, orderDirection]);

  useEffect(() => {
    setList([]);
  }, [sortedList]);

  const handleLoadMore = () => {
    if (isMore) return;
    setMore(true);
    if (list.length < sortedList.length) {
      const start = list.length;
      const end = Math.min(start + 20, sortedList.length);
      const newList = [...list, ...sortedList.slice(start, end)];
      setList(newList);
    }
    setMore(false);
  };

  const handleSort = (orderField: OrderBy) => {
    if (orderBy === orderField) {
      setOrderDirection(orderDirection === "asc" ? "desc" : "asc");
      return;
    }
    setOrderBy(orderField);
    setOrderDirection("desc");
  };

  return (
    <div className="overflow-x-auto bg-white border rounded shadow-md">
      <h3 className="px-8 py-4 font-semibold">{title}</h3>
      <table className="w-full token-market-table">
        <thead>
          <MarketTableHead
            onSort={handleSort}
            orderBy={orderBy}
            orderDirection={orderDirection}
          />
        </thead>
        {loading ? (
          <tbody>
            <MarketTableRowLoading />
            <MarketTableRowLoading />
            <MarketTableRowLoading />
            <MarketTableRowLoading />
          </tbody>
        ) : (
          // <InfiniteScroll
          //   loadMore={handleLoadMore}
          //   hasMore={list.length < data.length}
          //   useWindow
          //   threshold={10}
          // >
          <tbody>
            {sortedList.map((data, index) => (
              <MarketTableRow key={`${index}`} data={data} index={index} />
            ))}
          </tbody>
          // </InfiniteScroll>
        )}
      </table>
    </div>
  );
};
export default TokenMarketTable;
