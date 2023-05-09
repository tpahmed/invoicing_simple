import { createContext, useState } from "react";

export const Modal_Context = createContext();

export default function ModalContext({children}) {
    const [No_inv,setNo_inv] = useState('');
  return (
    <Modal_Context.Provider value={{ No_inv,setNo_inv }}>{children}</Modal_Context.Provider>
  )
}
