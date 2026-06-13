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

Comando Completo:
[Comando:] `npm install expo@54.0.35 react-native@0.81.5 react@19.1.0 @types/react@19.1.10 @expo/vector-icons@15.0.3 @react-native-async-storage/async-storage@2.2.0 @react-native-community/datetimepicker@8.4.4 @react-native-picker/picker@2.11.1 expo-image-picker@17.0.11 expo-status-bar@3.0.9 react-native-gesture-handler@2.28.0 react-native-safe-area-context@5.6.0 react-native-screens@4.16.0 typescript@5.9.2`
