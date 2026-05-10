import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@pk-task/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@pk-task/ui/components/card";

const placeholderMarkets = [
  {
    id: "eth-usdc-mainnet",
    loan: "USDC",
    collateral: "WETH",
    chain: "Ethereum",
    supplyApy: "5.42%",
    utilization: "78%",
  },
  {
    id: "wbtc-usdc-base",
    loan: "USDC",
    collateral: "WBTC",
    chain: "Base",
    supplyApy: "4.18%",
    utilization: "63%",
  },
];

export default function MarketsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal">Markets</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
            Server-backed Morpho market data will land here in the API
            milestone.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Market table placeholder</CardTitle>
          <CardDescription>
            Live data, filters, and watchlist actions are planned for upcoming
            milestones.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground text-left">
                <tr>
                  <th className="p-3 font-medium">Loan</th>
                  <th className="p-3 font-medium">Collateral</th>
                  <th className="p-3 font-medium">Chain</th>
                  <th className="p-3 font-medium">Supply APY</th>
                  <th className="p-3 font-medium">Utilization</th>
                  <th className="p-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {placeholderMarkets.map((market) => (
                  <tr key={market.id} className="bg-card border-t">
                    <td className="p-3 font-medium">{market.loan}</td>
                    <td className="p-3">{market.collateral}</td>
                    <td className="p-3">{market.chain}</td>
                    <td className="p-3">{market.supplyApy}</td>
                    <td className="p-3">{market.utilization}</td>
                    <td className="p-3 text-right">
                      <Button asChild variant="ghost" size="icon">
                        <Link
                          href={`/markets/${market.id}`}
                          aria-label="Open market"
                        >
                          <ArrowUpRight className="size-4" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
