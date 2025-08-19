import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Dumbbell, Loader2 } from 'lucide-react'
import { supabase } from './lib/supabase'
import DemoApp from './DemoApp'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isDemoMode, setIsDemoMode] = useState(false)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignIn = async (e) => {
    e.preventDefault()
    setLoading(true)
    setAuthError('')
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      setAuthError(error.message)
    }
    setLoading(false)
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setAuthError('')
    
    const { error } = await supabase.auth.signUp({
      email,
      password
    })
    
    if (error) {
      setAuthError(error.message)
    } else {
      setAuthError('Check your email for the confirmation link!')
    }
    setLoading(false)
  }

  const handleDemoMode = () => {
    setIsDemoMode(true)
  }

  // Show demo app if in demo mode
  if (isDemoMode) {
    return <DemoApp />
  }

  // Show loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p>Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show workout app if authenticated
  if (user) {
    return <DemoApp /> // For now, use demo app for authenticated users too
  }

  // Show authentication form
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Dumbbell className="h-8 w-8 text-blue-600" />
            <CardTitle className="text-2xl">Felix's Workout</CardTitle>
          </div>
          <p className="text-muted-foreground">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {authError && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {authError}
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </form>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
          </Button>

          {!isSignUp && (
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Demo Account:</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">Email: demo@example.com</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">Password: demo123</p>
            </div>
          )}
          
          <Button
            variant="outline"
            className="w-full"
            onClick={handleDemoMode}
          >
            Continue without account (Demo Mode)
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default App

