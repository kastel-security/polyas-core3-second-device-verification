declare global {
    namespace NodeJS {
      interface ProcessEnv {
        VITE_MOCK: string;
        VITE_BACKEND: string;
      }
    }
  }
  
  // If this file has no import/export statements (i.e. is a script)
  // convert it into a module by adding an empty export statement.
  export {}