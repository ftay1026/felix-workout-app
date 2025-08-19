import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'

const ProgressChart = ({ exerciseName, data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{exerciseName} Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="week" 
                tick={{ fontSize: 12 }}
                label={{ value: 'Week', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value, name) => [`${value}kg`, 'Weight']}
                labelFormatter={(label) => `Week ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#2563eb" 
                strokeWidth={2}
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProgressChart

