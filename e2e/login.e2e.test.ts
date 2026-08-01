// jcha_app/e2e/login.e2e.test.ts
const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals');
const { iniciarClient } = require('./config');

describe('🧪 Teste de Ponta a Ponta (E2E) - Login do Sistema', () => {
    let client;

    it('Deve abrir o projeto no Expo Go, preencher os dados de acesso e fazer o login com sucesso', async () => {
        client = await iniciarClient();
        
        const projetoCard = await client.$('//*[@text="jcha_app"]');
        await projetoCard.waitForDisplayed({ timeout: 15000 });
        await projetoCard.click();

        const textoBoasVindas = await client.$('//*[@text="Bem-vindo"]');
        await textoBoasVindas.waitForDisplayed({ timeout: 25000 });

        const inputEmail = await client.$('//*[@text="exemplo@moove.com"]');
        await inputEmail.setValue('juliano@chaves.com');

        const inputSenha = await client.$('//*[@text="Mínimo 6 caracteres"]');
        await inputSenha.setValue('juliano@123');

        if (await client.isKeyboardShown()) {
            await client.hideKeyboard();
        }

        const botaoEntrar = await client.$('//*[@text="Entrar"]');
        await botaoEntrar.click();

        const telaPrincipal = await client.$('//*[@text="Dashboard"]');
        await telaPrincipal.waitForDisplayed({ timeout: 10000 });
        expect(await telaPrincipal.isDisplayed()).toBe(true);

        await client.deleteSession();
    });
});