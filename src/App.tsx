import { Toaster } from 'react-hot-toast'
import { useSelector } from 'react-redux'
import ResultsScreen from './components/ResultsScreen'
import SettingsScreen from './components/SettingsScreen'
import SortingScreen from './components/SortingScreen'
import StartScreen from './components/StartScreen'
import type { RootState } from './store'

export default function App() {
  const screen = useSelector((s: RootState) => s.game.screen)
  return (
    <div className="min-h-full flex flex-col">
      <Toaster />
      {screen === 'start' && <StartScreen />}
      {screen === 'sort' && <SortingScreen />}
      {screen === 'results' && <ResultsScreen />}
      {screen === 'settings' && <SettingsScreen />}
    </div>
  )
}
