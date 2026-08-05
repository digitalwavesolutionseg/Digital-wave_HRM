"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const growthData = [
  { month: "Jan", employees: 180 },
  { month: "Feb", employees: 190 },
  { month: "Mar", employees: 202 },
  { month: "Apr", employees: 208 },
  { month: "May", employees: 215 },
  { month: "Jun", employees: 226 },
  { month: "Jul", employees: 236 },
  { month: "Aug", employees: 248 },
];

const attendanceData = [
  { day: "Mon", present: 232, absent: 16 },
  { day: "Tue", present: 238, absent: 10 },
  { day: "Wed", present: 226, absent: 22 },
  { day: "Thu", present: 240, absent: 8 },
  { day: "Fri", present: 220, absent: 28 },
];

const leaveTrend = [
  { month: "Mar", sick: 12, vacation: 18 },
  { month: "Apr", sick: 9, vacation: 22 },
  { month: "May", sick: 14, vacation: 15 },
  { month: "Jun", sick: 8, vacation: 26 },
  { month: "Jul", sick: 11, vacation: 20 },
  { month: "Aug", sick: 7, vacation: 24 },
];

const genderData = [
  { name: "Male", value: 142, color: "#0B5FFF" },
  { name: "Female", value: 98, color: "#8B5CF6" },
  { name: "Other", value: 8, color: "#22C55E" },
];

const departmentData = [
  { name: "Engineering", value: 86, color: "#0B5FFF" },
  { name: "Sales", value: 52, color: "#F59E0B" },
  { name: "Marketing", value: 38, color: "#8B5CF6" },
  { name: "Operations", value: 34, color: "#22C55E" },
  { name: "HR", value: 18, color: "#3B82F6" },
  { name: "Finance", value: 20, color: "#EF4444" },
];

export function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Employee Growth</CardTitle>
          <CardDescription>Headcount over the last 8 months</CardDescription>
        </CardHeader>
        <CardContent className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0B5FFF" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#0B5FFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="employees"
                stroke="#0B5FFF"
                strokeWidth={2.5}
                fill="url(#growthFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance This Week</CardTitle>
          <CardDescription>Present vs absent by day</CardDescription>
        </CardHeader>
        <CardContent className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attendanceData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="present" fill="#0B5FFF" radius={[4, 4, 0, 0]} maxBarSize={32} />
              <Bar dataKey="absent" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leave Trends</CardTitle>
          <CardDescription>Sick leave vs vacation over 6 months</CardDescription>
        </CardHeader>
        <CardContent className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={leaveTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="sick" name="Sick" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={24} />
              <Bar dataKey="vacation" name="Vacation" fill="#0B5FFF" radius={[4, 4, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  innerRadius={48}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {genderData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Departments</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px] overflow-y-auto">
            <div className="space-y-3">
              {departmentData.map((d) => (
                <div key={d.name} className="flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="flex-1 text-sm">{d.name}</span>
                  <span className="text-sm font-semibold">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}