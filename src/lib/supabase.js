import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://skakjkmipmcclaqkznxq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrYWtqa21pcG1jY2xhcWt6bnhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1OTAwODUsImV4cCI6MjA3MTE2NjA4NX0.eZr0-iJGRTwrzg7mXJBc5_1oiMkFMEpFztewfXLr5b8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database schema for workout tracking
export const createWorkoutProgressTable = async () => {
  // This would be run once to set up the database
  const { error } = await supabase.rpc('create_workout_progress_table')
  if (error) console.error('Error creating table:', error)
}

// Save completed set
export const saveCompletedSet = async (userId, date, exerciseName, setIndex) => {
  const { data, error } = await supabase
    .from('workout_progress')
    .upsert({
      user_id: userId,
      workout_date: date,
      exercise_name: exerciseName,
      set_index: setIndex,
      completed_at: new Date().toISOString()
    })
  
  if (error) console.error('Error saving set:', error)
  return { data, error }
}

// Load completed sets for a date
export const loadCompletedSets = async (userId, date) => {
  const { data, error } = await supabase
    .from('workout_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('workout_date', date)
  
  if (error) console.error('Error loading sets:', error)
  return { data, error }
}

// Remove completed set
export const removeCompletedSet = async (userId, date, exerciseName, setIndex) => {
  const { error } = await supabase
    .from('workout_progress')
    .delete()
    .eq('user_id', userId)
    .eq('workout_date', date)
    .eq('exercise_name', exerciseName)
    .eq('set_index', setIndex)
  
  if (error) console.error('Error removing set:', error)
  return { error }
}

// Get workout statistics
export const getWorkoutStats = async (userId) => {
  const { data, error } = await supabase
    .from('workout_progress')
    .select('workout_date, exercise_name')
    .eq('user_id', userId)
  
  if (error) console.error('Error loading stats:', error)
  return { data, error }
}

