// jcha_app/e2e/cadastro.e2e.test.ts
const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals');
const { iniciarClient } = require('./config');

describe('🧪 Teste de Ponta a Ponta (E2E) - Cadastro de Admin', () => {
     /** @type {any} */
     // @ts-ignore
    let client = null;  

    beforeAll(async () => {
        client = await iniciarClient();
    });

    afterAll(async () => {
        if (client) {
            await client.deleteSession();
        }
    });

    it('Deve abrir o projeto no Expo Go, preencher o formulário e enviar os dados para a API', async () => {
        const projetoCard = await client.$('//*[@text="jcha_app"]');
        await projetoCard.waitForDisplayed({ timeout: 2000 });
        await projetoCard.click();

        // 🌟 CORREÇÃO: Espera explicitamente o campo de nome carregar na tela
        const inputNome = await client.$('//*[@text="Nome Completo"]');
        await inputNome.waitForDisplayed({ timeout: 3000 }); 
        await inputNome.setValue('Juliano Administrador');

        const inputEmail = await client.$('//*[@text="exemplo@moove.com"]');
        await inputEmail.setValue('admin@email.com');

        const inputSenha = await client.$('//*[@text="Mínimo 6 caracteres"]');
        await inputSenha.setValue('barbaralho@73');

        const botaoCadastrar = await client.$('//*[@text="Cadastrar"]');
        await botaoCadastrar.click();

        const mensagemSucesso = await client.$('//*[@text="Cadastro realizado com sucesso!"]');
        await mensagemSucesso.waitForDisplayed({ timeout: 2000 });
        
        expect(await mensagemSucesso.isDisplayed()).toBe(true);
    });
});