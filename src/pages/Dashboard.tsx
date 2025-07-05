import React from 'react';
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Plane, 
  Building2,
  CreditCard,
  UserCheck
} from 'lucide-react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Card from '../components/ui/Card';
// import ChartCard from '../components/UI/ChartCard';
// import { mockDashboardStats, mockChartData } from '../data/mockData';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* <Card
          title="Total Bookings"
          value={1234}
          icon={Calendar}
          trend={{ value: 12.5, isPositive: true }}
        />
        <Card
          title="Total Revenue"
          value={`$233`}
          icon={DollarSign}
          trend={{ value: 8.2, isPositive: true }}
        />
        <Card
          title="Active Listings"
          value={123}
          icon={TrendingUp}
          trend={{ value: 3.1, isPositive: false }}
        />
        <Card
          title="Active Users"
          value={345}
          icon={Users}
          trend={{ value: 15.3, isPositive: true }}
        /> */}
      </div>

      {/* Secondary Stats */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          title="Flight Bookings"
          value={mockDashboardStats.flightBookings}
          icon={Plane}
        />
        <Card
          title="Hotel Bookings"
          value={mockDashboardStats.hotelBookings}
          icon={Building2}
        />
        <Card
          title="Pending Payments"
          value={mockDashboardStats.pendingPayments}
          icon={CreditCard}
        />
        <Card
          title="Today's Bookings"
          value={mockDashboardStats.todayBookings}
          icon={UserCheck}
        />
      </div> */}

      {/* Charts */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Booking Trends" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockChartData.bookingTrends}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--tooltip-bg)', 
                  border: 'none', 
                  borderRadius: '8px',
                  boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="flights" 
                stroke="#3B86D1" 
                strokeWidth={3}
                dot={{ fill: '#3B86D1', strokeWidth: 2, r: 4 }}
                name="Flights"
              />
              <Line 
                type="monotone" 
                dataKey="hotels" 
                stroke="#21BF06" 
                strokeWidth={3}
                dot={{ fill: '#21BF06', strokeWidth: 2, r: 4 }}
                name="Hotels"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Services" icon={BarChart}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockChartData.topServices} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                type="number"
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                width={120}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--tooltip-bg)', 
                  border: 'none', 
                  borderRadius: '8px',
                  boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey="value" 
                fill="#844FC1"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div> */}

      {/* Revenue Chart */}
      {/* <ChartCard title="Monthly Revenue" icon={DollarSign}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockChartData.revenueByMonth}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              className="text-xs"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'currentColor' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--tooltip-bg)', 
                border: 'none', 
                borderRadius: '8px',
                boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#21BF06" 
              strokeWidth={3}
              dot={{ fill: '#21BF06', strokeWidth: 2, r: 4 }}
              fill="url(#colorRevenue)"
            />
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#21BF06" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#21BF06" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </ChartCard> */}
    </div>
  );
};

export default Dashboard;