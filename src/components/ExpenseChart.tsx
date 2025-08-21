// Recharts-based line chart rendering monthly/daily expenses vs a budget line.
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface ExpensePoint {
  label: string;
  value: number;
  budgetLimit: number;
  exceeded: boolean;
}

interface ExpenseChartProps {
  data: ExpensePoint[];
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ data }) => {
  const maxY = Math.max(
    0,
    ...data.map((d) => Math.max(d.value, d.budgetLimit))
  );
  const yDomainMax = Math.ceil(maxY * 1.2) || 10;
  const budgetLineValue = data.length > 0 ? data[0].budgetLimit : 0;

  return (
    <div className="w-full h-[420px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 16, right: 24, bottom: 8, left: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, yDomainMax]} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: any, name: any, item: any) => {
              if (name === "value") {
                const v = Number(value).toLocaleString();
                const over = item?.payload?.exceeded ? " (Over budget)" : "";
                return [v, `Expense${over}`];
              }
              return [value, name];
            }}
            labelFormatter={(label) => `${label}`}
            contentStyle={{ fontSize: 12 }}
          />
          {budgetLineValue > 0 && (
            <ReferenceLine
              y={budgetLineValue}
              stroke="#EF4444"
              strokeDasharray="5 5"
              label={{
                value: "Budget",
                position: "insideTopRight",
                fill: "#EF4444",
                fontSize: 12,
              }}
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke="#6D28D9"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={(dotProps: any) => {
              const exceeded = dotProps?.payload?.exceeded;
              return (
                <circle
                  cx={dotProps.cx}
                  cy={dotProps.cy}
                  r={6}
                  fill={exceeded ? "#EF4444" : "#6D28D9"}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              );
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpenseChart;
