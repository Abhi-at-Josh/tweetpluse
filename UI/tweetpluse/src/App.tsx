import './App.css'
import { createBrowserRouter ,RouterProvider } from "react-router-dom";
import LandingPage from './components/Landing' 
import AnalyzeTweets from './components/AnalyzeTweets';
function App() {
  const router = createBrowserRouter([
    {
      path :"/",
      element:<LandingPage/>
    },
    {
      path :"analyzetweets",
      element:<AnalyzeTweets/>
    }
  ])
  return (
      <>
     <RouterProvider router={router} />
      </>
  )
}

export default App
