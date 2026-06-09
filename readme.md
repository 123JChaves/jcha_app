# Requisitos

* Node.js 22 ou superior - Conferir a versão: node -v
* EXPO GO - Baixar aplicativo Expo Go da Play Store ou App Store.

Criar o projeto com `React Native` usando expo.

`npx create-expo-app@latest . --template`

Na instalação utilizar o template "Blank (TypeScript)"

Executar o projeto: [`npx expo start`]

* Baixar o aplicativo Expo Go na Play Store ou App Store
* Ler o QRCode da aplicação com o aplicativo Expo Go

Se algo der errado, como a falha da conexão entre App e o PC/Notebook:
Executar o comando: [`npx expo start --tunnel`]

Para realizar a conexão com a API instalar a biblioteca [`Axios`]
Executar o comando: [`npm install axios`]

Instale uma biblioteca logica que manipula os cookies no navegador.
[Comando:] `npm install js-cookie`

Instale as declarações de tipo para que o TypeScript entenda os comandos da biblioteca e pare de exibir o erro "Cannot find module".
[Comando:] `npm install -D @types/js-cookie`

Instalar:
[Comando:] `npx expo install @react-native-async-storage/async-storage`

Instalar o [.env:]
`npm install dotenv`
`Na entidade = import 'dotenv/config';`

Comando para importar um [.gitgnore] já configurado:
`npx gitignore node`

Para as rotas, instalar as seguintes dependências:
[Comando:] `npm install @react-navigation/native @react-navigation/native-stack`
[Comando:] `npm install react-native-screens react-native-safe-area-context`

Para ícones:
[Comando:] `npx expo install @expo/vector-icons`

Ao usar esse comando, o Expo já prepara as permissões nativas necessárias
(acesso à galeria e câmera) para o Android e iOS.
[Comando:] `npx expo install expo-image-picker`
[Comando:] `npx expo install @react-native-picker/picker`

Para Views:
[Comando:] `npx expo install react-native-safe-area-context`

Para implementar o recurso de arrastar e soltar (Drag and Drop) no React Native:
[Comando:] `npx expo install react-native-draggable-flatlist react-native-gesture-handler`

Biblioteca de calendário:
[Comando:] `npx expo install @react-native-community/datetimepicker`
