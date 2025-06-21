"use client"

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts"
import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface ExpenseChartProps {
  data: { name: string; value: number }[]
  type?: "pie" | "bar"
}

const COLORS = [
  "#0088FE",
  "#00C49F", 
  "#FFBB28",
  "#FF8042",
  "#A569BD",
  "#5DADE2",
  "#48C9B0",
  "#F4D03F",
  "#EB984E",
  "#EC7063",
  "#85C1E9",
  "#82E0AA",
]

export function ExpenseChart({ data, type = "pie" }: ExpenseChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="text-center text-muted-foreground">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            📊
          </div>
          <p className="font-medium">No expense data available</p>
          <p className="text-sm">Add some expenses to see the breakdown</p>
        </div>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <Card className="p-3 shadow-lg border">
          <div className="space-y-1">
            <p className="font-medium text-sm">{data.name || label}</p>
            <p className="text-primary font-semibold">{formatCurrency(data.value)}</p>
            <p className="text-xs text-muted-foreground">
              {((data.value / data.payload?.total || 0) * 100).toFixed(1)}% of total
            </p>
          </div>
        </Card>
      )
    }
    return null
  }

  const total = data.reduce((sum, d) => sum + d.value, 0)
  const dataWithTotal = data.map(item => ({ ...item, total }))

  if (type === "bar") {
    return (
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dataWithTotal} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
              interval={0}
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value)}
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {dataWithTotal.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="w-full h-[300px]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
        {/* Pie Chart */}
        <div className="lg:col-span-2 h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataWithTotal}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius="85%"
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {dataWithTotal.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="lg:col-span-1 h-full overflow-y-auto">
          <div className="space-y-3 p-2">
            <h4 className="font-medium text-sm text-muted-foreground mb-3">Categories</h4>
            {data.map((entry, idx) => (
              <div key={entry.name} className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="font-medium text-sm truncate">{entry.name}</span>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-semibold text-sm">{formatCurrency(entry.value)}</div>
                  <div className="text-xs font-medium" style={{ color: COLORS[idx % COLORS.length] }}>
                    {((entry.value / total) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}