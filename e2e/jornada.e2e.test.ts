// jcha_app/e2e/jornada.e2e.test.ts
const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals');
const { iniciarClient } = require('./config');

describe('🧪 Jornada Integrada (E2E) - Login seguido de Cadastro', () => {
    // 🌟 CORREÇÃO: Removida a tipagem para o Babel rodar localmente sem quebrar
     /** @type {any} */
    let client = null;

    beforeAll(async () => {
        client = await iniciarClient();
    });

    afterAll(async () => {
        if (client) {
            await client.deleteSession();
        }
    });

    it('1. Deve realizar o login com sucesso', async () => {
        const projetoCard = await client.$('//*[@text="jcha_app"]');
        await projetoCard.waitForDisplayed({ timeout: 1000 });
        await projetoCard.click();

        const inputEmail = await client.$('//*[@text="exemplo@moove.com"]');
        await inputEmail.setValue('usuario@moove.com');

        const inputSenha = await client.$('//*[@text="Mínimo 6 caracteres"]');
        await inputSenha.setValue('senha123');

        const botaoLogin = await client.$('//*[@text="Entrar"]');
        await botaoLogin.click();

        const telaHome = await client.$('//*[@text="Bem-vindo"]');
        await telaHome.waitForDisplayed({ timeout: 1000 });
        expect(await telaHome.isDisplayed()).toBe(true);
    });

    it('2. Deve navegar e realizar o cadastro de administrador com sucesso', async () => {
        const inputNome = await client.$('//*[@text="Nome Completo"]');
        await inputNome.setValue('Juliano Administrador');

        const inputEmailCadastro = await client.$('//*[@text="exemplo@moove.com"]');
        await inputEmailCadastro.setValue('admin@email.com');

        const inputSenhaCadastro = await client.$('//*[@text="Mínimo 6 caracteres"]');
        await inputSenhaCadastro.setValue('barbaralho@73');

        const botaoCadastrar = await client.$('//*[@text="Cadastrar"]');
        await botaoCadastrar.click();

        const mensagemSucesso = await client.$('//*[@text="Cadastro realizado com sucesso!"]');
        await mensagemSucesso.waitForDisplayed({ timeout: 1000 });
        
        expect(await mensagemSucesso.isDisplayed()).toBe(true);
    });
});