import { supabase } from './supabase.js'

// Save completed set
export const saveCompletedSet = async (userId, date, exerciseName, setIndex) => {
  const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD format
  
  const { data, error } = await supabase
    .from('workout_progress')
    .upsert({
      user_id: userId,
      workout_date: dateStr,
      exercise_name: exerciseName,
      set_index: setIndex,
      completed_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,workout_date,exercise_name,set_index'
    })
  
  if (error) console.error('Error saving set:', error)
  return { data, error }
}

// Load completed sets for a date
export const loadCompletedSets = async (userId, date) => {
  const dateStr = date.toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('workout_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('workout_date', dateStr)
  
  if (error) console.error('Error loading sets:', error)
  return { data, error }
}

// Remove completed set
export const removeCompletedSet = async (userId, date, exerciseName, setIndex) => {
  const dateStr = date.toISOString().split('T')[0]
  
  const { error } = await supabase
    .from('workout_progress')
    .delete()
    .eq('user_id', userId)
    .eq('workout_date', dateStr)
    .eq('exercise_name', exerciseName)
    .eq('set_index', setIndex)
  
  if (error) console.error('Error removing set:', error)
  return { error }
}

// Get workout statistics
export const getWorkoutStats = async (userId) => {
  const { data, error } = await supabase
    .from('workout_progress')
    .select('workout_date, exercise_name, set_index')
    .eq('user_id', userId)
    .order('workout_date', { ascending: false })
  
  if (error) console.error('Error loading stats:', error)
  return { data, error }
}

// Get workout history for progress tracking
export const getWorkoutHistory = async (userId, exerciseName, limit = 20) => {
  const { data, error } = await supabase
    .from('workout_progress')
    .select('workout_date, set_index')
    .eq('user_id', userId)
    .eq('exercise_name', exerciseName)
    .order('workout_date', { ascending: true })
    .limit(limit)
  
  if (error) console.error('Error loading history:', error)
  return { data, error }
}

