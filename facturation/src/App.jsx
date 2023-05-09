import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Container from './components/Container'
import CreeFacture from './components/Cree'
import GereFacture from './components/Gere'
import AfficherFacture from './components/Afficher'
import ModifierFacture from './components/Modifier'

function App() {

  return (
    <div className="App">
      <BrowserRouter basename='/'>
        <Routes>
          <Route path='facture/ajouter' element={<Container><CreeFacture/></Container>}/>
          <Route path='facture/view/:id' element={<AfficherFacture/>}/>
          <Route path='facture/edit/:id' element={<Container><ModifierFacture/></Container>}/>
          <Route path='facture/gere' element={<Container><GereFacture/></Container>}/>
          <Route path='*' element={<Navigate to={'facture/gere'}/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
