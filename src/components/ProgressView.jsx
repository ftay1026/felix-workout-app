import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { TrendingUp, Calendar, Target, Award } from 'lucide-react'
import ProgressChart from './ProgressChart.jsx'

const ProgressView = ({ exercises, startDate }) => {
  const [selectedExercise, setSelectedExercise] = useState('Barbell Curls')

  // Generate progress data for selected exercise
  const generateProgressData = (exerciseName) => {
    const exercise = exercises.find(ex => ex.name === exerciseName)
    if (!exercise) return []

    const data = []
    const currentDate = new Date()
    const weeksPassed = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24 * 7)) + 1

    for (let week = 1; week <= Math.min(weeksPassed + 4, 52); week++) {
      const weekInCycle = ((week - 1) % 4) + 1
      const monthsPassed = Math.floor(week / 4)
      
      let weight = exercise.baseWeight
      if (typeof weight === 'number') {
        // Apply monthly progression
        if (exercise.type === "compound") {
          weight += monthsPassed * 5
        } else if (exercise.type === "isolation") {
          weight += monthsPassed * 2.5
        }

        // Apply weekly progression
        if (weekInCycle === 3) {
          if (exercise.type === "compound") {
            weight += 2.5
          } else if (exercise.type === "isolation") {
            weight += 1.25
          }
        } else if (weekInCycle === 4) {
          weight = Math.round(weight * 0.8 * 10) / 10
        }
      }

      data.push({
        week,
        weight: typeof weight === 'number' ? weight : 0,
        phase: week <= 12 ? 1 : (week <= 24 ? 2 : (week <= 36 ? 3 : 4))
      })
    }

    return data
  }

  // Calculate stats
  const calculateStats = () => {
    const currentDate = new Date()
    const weeksPassed = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24 * 7)) + 1
    const workoutsDone = weeksPassed * 6 // 6 days per week
    const totalWorkouts = 52 * 6 // Total workouts in program
    const completionRate = Math.min((workoutsDone / totalWorkouts) * 100, 100)

    return {
      weeksPassed,
      workoutsDone,
      completionRate: Math.round(completionRate),
      currentPhase: weeksPassed <= 12 ? 1 : (weeksPassed <= 24 ? 2 : (weeksPassed <= 36 ? 3 : 4))
    }
  }

  const stats = calculateStats()
  const progressData = generateProgressData(selectedExercise)
  const currentWeight = progressData[progressData.length - 1]?.weight || 0
  const startWeight = progressData[0]?.weight || 0
  const weightGain = currentWeight - startWeight

  // Key exercises for tracking
  const keyExercises = [
    'Barbell Curls',
    'Barbell Shoulder Press', 
    'Bench Press',
    'Lat Pulldown',
    'Leg Press',
    'Triceps Pressdown'
  ].filter(name => exercises.some(ex => ex.name === name))

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{stats.weeksPassed}</div>
              <p className="text-sm text-muted-foreground">Weeks Completed</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{stats.completionRate}%</div>
              <p className="text-sm text-muted-foreground">Program Complete</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Phase */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Current Phase</h3>
              <p className="text-sm text-muted-foreground">
                {stats.currentPhase === 1 ? 'Adaptation & Volume Build' :
                 stats.currentPhase === 2 ? 'Intensity Escalation' :
                 stats.currentPhase === 3 ? 'Arm Specialization' :
                 'Peak & Refine'}
              </p>
            </div>
            <Badge variant={stats.currentPhase === 1 ? 'default' : 
                           stats.currentPhase === 2 ? 'secondary' :
                           stats.currentPhase === 3 ? 'destructive' : 'outline'}>
              Phase {stats.currentPhase}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Strength Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {keyExercises.map(exerciseName => (
              <Button
                key={exerciseName}
                variant={selectedExercise === exerciseName ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedExercise(exerciseName)}
                className="text-xs"
              >
                {exerciseName.replace('Barbell ', '').replace('Cable ', '')}
              </Button>
            ))}
          </div>

          {/* Progress Stats */}
          {weightGain > 0 && (
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  +{weightGain}kg gained
                </span>
              </div>
              <div className="text-sm text-green-600">
                {startWeight}kg → {currentWeight}kg
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Chart */}
      <ProgressChart exerciseName={selectedExercise} data={progressData} />

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-4 w-4" />
            Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">First Month Complete</span>
              <Badge variant={stats.weeksPassed >= 4 ? 'default' : 'outline'}>
                {stats.weeksPassed >= 4 ? '✓' : `${Math.max(0, 4 - stats.weeksPassed)} weeks`}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Phase 1 Complete</span>
              <Badge variant={stats.weeksPassed >= 12 ? 'default' : 'outline'}>
                {stats.weeksPassed >= 12 ? '✓' : `${Math.max(0, 12 - stats.weeksPassed)} weeks`}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Halfway Point</span>
              <Badge variant={stats.weeksPassed >= 26 ? 'default' : 'outline'}>
                {stats.weeksPassed >= 26 ? '✓' : `${Math.max(0, 26 - stats.weeksPassed)} weeks`}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Program Complete</span>
              <Badge variant={stats.weeksPassed >= 52 ? 'default' : 'outline'}>
                {stats.weeksPassed >= 52 ? '✓' : `${Math.max(0, 52 - stats.weeksPassed)} weeks`}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProgressView

