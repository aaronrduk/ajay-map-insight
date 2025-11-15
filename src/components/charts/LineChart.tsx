import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface LineChartProps {
  data: any[];
  dataKeys: { key: string; color: string; name: string }[];
  xAxisKey: string;
  height?: number;
}

export const LineChart = ({ data, dataKeys, xAxisKey, height = 300 }: LineChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey={xAxisKey} stroke="hsl(var(--muted-foreground))" />
        <YAxis stroke="hsl(var(--muted-foreground))" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
        />
        <Legend />
        {dataKeys.map((dk) => (
          <Line key={dk.key} type="monotone" dataKey={dk.key} stroke={dk.color} name={dk.name} strokeWidth={2} />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};
