'use client'
import { ChakraProvider } from '@chakra-ui/react'
import './globals.css'
import theme from './theme'


export function Providers(props) {

  const { children, ...rest } = props

  return (
    <ChakraProvider theme={theme}>
        {children}
    </ChakraProvider>
  )

}