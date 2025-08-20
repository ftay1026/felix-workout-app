import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Switch } from '@/components/ui/switch.jsx'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, BarChart3, Calendar } from 'lucide-react'

// Import exercises data (same as in DemoApp)
const exercises = {
  "SHOULDERS": [
    { name: "DB Lateral Raises", baseWeight: 7.5, baseReps: 15, baseSets: 2, tempo: "3-3", rest: "30s", type: "isolation" },
    { name: "Barbell Shoulder Press", baseWeight: 40, baseReps: 8, baseSets: 1, tempo: "5-5", rest: "2min", type: "compound" }
  ],
  "BICEPS": [
    { name: "Cable Hammer Curls", baseWeight: 20, baseReps: 12, baseSets: 2, tempo: "3-3", rest: "30s", type: "isolation" },
    { name: "Barbell Curls", baseWeight: 27.5, baseReps: 8, baseSets: 1, tempo: "5-5", rest: "2min", type: "compound" },
    { name: "21s (Biceps)", baseWeight: 15, baseReps: 21, baseSets: 1, tempo: "7-7-7", rest: "90s", type: "isolation" }
  ],
  "TRICEPS": [
    { name: "Overhead Cable Extension", baseWeight: 25, baseReps: 12, baseSets: 2, tempo: "3-3", rest: "30s", type: "isolation" },
    { name: "Triceps Pressdown", baseWeight: 32.5, baseReps: 8, baseSets: 1, tempo: "5-5", rest: "2min", type: "compound" },
    { name: "Diamond Push-ups", baseWeight: "BW", baseReps: "FAIL", baseSets: 1, tempo: "2-2", rest: "END", type: "bodyweight" }
  ],
  "CHEST": [
    { name: "Cable Flies", baseWeight: 15, baseReps: 15, baseSets: 2, tempo: "3-3", rest: "30s", type: "isolation" },
    { name: "Bench Press", baseWeight: 55, baseReps: 8, baseSets: 1, tempo: "5-5", rest: "2min", type: "compound" },
    { name: "Incline DB Press", baseWeight: 20, baseReps: 10, baseSets: 2, tempo: "4-4", rest: "90s", type: "compound" },
    { name: "Dips", baseWeight: "BW", baseReps: 10, baseSets: 2, tempo: "3-3", rest: "90s", type: "bodyweight" }
  ],
  "BACK": [
    { name: "Straight-Arm Pulldowns", baseWeight: 25, baseReps: 15, baseSets: 2, tempo: "3-3", rest: "30s", type: "isolation" },
    { name: "Lat Pulldown", baseWeight: 42.5, baseReps: 8, baseSets: 1, tempo: "5-5", rest: "2min", type: "compound" },
    { name: "Bent-Over Row", baseWeight: 40, baseReps: 10, baseSets: 2, tempo: "4-4", rest: "90s", type: "compound" }
  ],
  "LEGS": [
    { name: "Leg Extensions", baseWeight: 30, baseReps: 15, baseSets: 2, tempo: "3-3", rest: "30s", type: "isolation" },
    { name: "Leg Press", baseWeight: 65, baseReps: 10, baseSets: 1, tempo: "5-5", rest: "3min", type: "compound" },
    { name: "Lying Leg Curls", baseWeight: 25, baseReps: 12, baseSets: 3, tempo: "3-3", rest: "90s", type: "isolation" },
    { name: "Romanian Deadlifts", baseWeight: 50, baseReps: 10, baseSets: 2, tempo: "5-5", rest: "2min", type: "compound" },
    { name: "Standing Calf Raises", baseWeight: 40, baseReps: 20, baseSets: 3, tempo: "2-2", rest: "60s", type: "isolation" }
  ],
  "CORE": [
    { name: "Plank", baseWeight: "BW", baseReps: "30s", baseSets: 2, tempo: "HOLD", rest: "2min", type: "bodyweight" },
    { name: "Russian Twists", baseWeight: 10, baseReps: "30s", baseSets: 2, tempo: "FAST", rest: "0s", type: "isolation" },
    { name: "Leg Raises", baseWeight: "BW", baseReps: "30s", baseSets: 2, tempo: "SLOW", rest: "0s", type: "bodyweight" }
  ]
}

const ProgressView = () => {
  const [selectedExercises, setSelectedExercises] = useState({})
  const [chartData, setChartData] = useState({})
  const [timeRange, setTimeRange] = useState('12weeks') // 12weeks, 6months, 12months

  // Get all exercises in a flat array
  const allExercises = Object.values(exercises).flat().filter(ex => typeof ex.baseWeight === 'number')

  // Calculate expected progression for an exercise over time
  const calculateExpectedProgression = (exercise, weeks = 12) => {
    const startDate = new Date('2025-08-19')
    const data = []
    
    for (let week = 1; week <= weeks; week++) {
      const weekDate = new Date(startDate)
      weekDate.setDate(weekDate.getDate() + (week - 1) * 7)
      
      const weekInCycle = ((week - 1) % 4) + 1
      const phase = Math.floor((week - 1) / 13) + 1
      
      let weight = exercise.baseWeight
      let reps = exercise.baseReps
      
      // Apply weekly progression
      if (weekInCycle === 2) {
        reps += 1
      } else if (weekInCycle === 3) {
        if (exercise.type === "compound") {
          weight += 2.5
        } else if (exercise.type === "isolation") {
          weight += 1.25
        }
      } else if (weekInCycle === 4) {
        weight *= 0.8
        weight = Math.round(weight * 4) / 4
      }
      
      // Apply monthly progression (simplified)
      const monthlyIncrease = Math.floor((week - 1) / 4)
      if (exercise.type === "compound") {
        weight += monthlyIncrease * 2.5
      } else {
        weight += monthlyIncrease * 1.25
      }
      
      data.push({
        week: `W${week}`,
        date: weekDate.toISOString().split('T')[0],
        expected: Math.round(weight * 4) / 4,
        expectedReps: reps
      })
    }
    
    return data
  }

  // Get actual performance data from localStorage
  const getActualPerformanceData = (exerciseName, expectedData) => {
    const actualData = expectedData.map(point => {
      const savedData = localStorage.getItem(`workout-performance-${point.date}`)
      if (savedData) {
        const dayData = JSON.parse(savedData)
        if (dayData[exerciseName] && dayData[exerciseName].weights) {
          // Get average weight used for that day
          const weights = dayData[exerciseName].weights.filter(w => typeof w === 'number')
          const reps = dayData[exerciseName].reps.filter(r => typeof r === 'number')
          
          if (weights.length > 0) {
            const avgWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length
            const avgReps = reps.length > 0 ? reps.reduce((sum, r) => sum + r, 0) / reps.length : point.expectedReps
            
            return {
              ...point,
              actual: Math.round(avgWeight * 4) / 4,
              actualReps: Math.round(avgReps)
            }
          }
        }
      }
      return point
    })
    
    return actualData
  }

  // Toggle exercise selection
  const toggleExercise = (exerciseName) => {
    setSelectedExercises(prev => ({
      ...prev,
      [exerciseName]: !prev[exerciseName]
    }))
  }

  // Generate chart data for selected exercises
  useEffect(() => {
    const newChartData = {}
    
    Object.entries(selectedExercises).forEach(([exerciseName, isSelected]) => {
      if (isSelected) {
        const exercise = allExercises.find(ex => ex.name === exerciseName)
        if (exercise) {
          const weeks = timeRange === '12weeks' ? 12 : timeRange === '6months' ? 26 : 52
          const expectedData = calculateExpectedProgression(exercise, weeks)
          const actualData = getActualPerformanceData(exerciseName, expectedData)
          newChartData[exerciseName] = actualData
        }
      }
    })
    
    setChartData(newChartData)
  }, [selectedExercises, timeRange])

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}kg
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <CardTitle className="text-2xl">Progress Analytics</CardTitle>
            </div>
            <p className="text-muted-foreground">
              Track your actual performance vs expected progression over time
            </p>
          </CardHeader>

          <CardContent>
            {/* Time Range Selector */}
            <div className="flex gap-2 mb-6 justify-center">
              <Button
                variant={timeRange === '12weeks' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('12weeks')}
              >
                12 Weeks
              </Button>
              <Button
                variant={timeRange === '6months' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('6months')}
              >
                6 Months
              </Button>
              <Button
                variant={timeRange === '12months' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('12months')}
              >
                12 Months
              </Button>
            </div>

            {/* Exercise Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Select Exercises to Track
              </h3>
              
              {Object.entries(exercises).map(([group, groupExercises]) => (
                <div key={group} className="mb-4">
                  <h4 className="text-md font-medium text-blue-600 mb-2">{group}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {groupExercises
                      .filter(exercise => typeof exercise.baseWeight === 'number')
                      .map(exercise => (
                        <div key={exercise.name} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{exercise.name}</div>
                            <div className="flex gap-1 mt-1">
                              <Badge variant="outline" className="text-xs">{exercise.type}</Badge>
                              <Badge variant="secondary" className="text-xs">{exercise.baseWeight}kg</Badge>
                            </div>
                          </div>
                          <Switch
                            checked={selectedExercises[exercise.name] || false}
                            onCheckedChange={() => toggleExercise(exercise.name)}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="space-y-8">
              {Object.entries(chartData).map(([exerciseName, data]) => (
                <Card key={exerciseName} className="p-4">
                  <CardHeader>
                    <CardTitle className="text-lg">{exerciseName}</CardTitle>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-black rounded-full"></div>
                        <span>Expected</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Actual (Above Expected)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>Actual (Below Expected)</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="expected" 
                          stroke="#000000" 
                          strokeWidth={2}
                          name="Expected"
                          connectNulls={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="actual" 
                          stroke="#22c55e"
                          strokeWidth={2}
                          name="Actual"
                          connectNulls={false}
                          dot={(props) => {
                            const { payload } = props
                            if (payload && payload.actual && payload.expected) {
                              const color = payload.actual >= payload.expected ? "#22c55e" : "#ef4444"
                              return <circle {...props} fill={color} stroke={color} r={3} />
                            }
                            return null
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              ))}
              
              {Object.keys(selectedExercises).filter(key => selectedExercises[key]).length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No Exercises Selected</h3>
                  <p className="text-muted-foreground">
                    Select exercises above to see your progress charts
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ProgressView

