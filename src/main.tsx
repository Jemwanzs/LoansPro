import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// -- code copy protection: disable right-click and certain shortcuts --
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && (e.key === 'u' || e.key === 'i' || e.key === 'c')) {
    e.preventDefault();
  }
});

// -- passcode protection with 3 attempts before blocking --
const passcode = 'JM2022!';
let attempts = 0;
let accessGranted = false;

while (attempts < 3) {
  const userPass = prompt('Enter passcode to continue:');
  
  if (userPass === passcode) {
    accessGranted = true;
    break;
  } else {
    attempts++;
    alert(`Incorrect passcode. You have ${3 - attempts} attempt(s) remaining.`);
  }
}

if (accessGranted) {
  createRoot(document.getElementById("root")!).render(<App />);
} else {
  alert('Access denied. Too many incorrect attempts.');
  window.location.href = 'about:blank';  // or leave it idle
}




/* ===================================
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);

//--code copy protection < right click and other chortcuts dissabled-- >
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && (e.key === 'u' || e.key === 'i' || e.key === 'c')) {
        e.preventDefault();
    }
});
*/