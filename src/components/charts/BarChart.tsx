import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface BarChartProps {
  data: any[];
  dataKeys: { key: string; color: string; name: string }[];
  xAxisKey: string;
  height?: number;
}

export const BarChart = ({ data, dataKeys, xAxisKey, height = 300 }: BarChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
          <Bar key={dk.key} dataKey={dk.key} fill={dk.color} name={dk.name} />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};
