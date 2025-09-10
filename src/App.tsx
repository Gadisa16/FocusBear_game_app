import { useSelector } from 'react-redux'
import ResultsScreen from './components/ResultsScreen'
import SortingScreen from './components/SortingScreen'
import StartScreen from './components/StartScreen'
import type { RootState } from './store'

export default function App() {
  const screen = useSelector((s: RootState) => s.game.screen)
  return (
    <div className="min-h-full flex flex-col">
      {screen === 'start' && <StartScreen />}
      {screen === 'sort' && <SortingScreen />}
      {screen === 'results' && <ResultsScreen />}
    </div>
  )
}
