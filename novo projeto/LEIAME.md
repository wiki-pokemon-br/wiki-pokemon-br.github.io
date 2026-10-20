# Wiki Pokémon — passo a passo

## Arquivos
| Arquivo | Para que serve |
|---|---|
| `login.html` | Tela de login com Google |
| `index.html` | Pokédex (busca, geração, tipo) |
| `pokemon.html` | Página de cada Pokémon |
| `firebase-config.js` | **Você cola os dados do Firebase aqui** e muda o nome do site |
| `style.css` | Cores do site (topo do arquivo) |
| `firestore.rules` | Regras de segurança para colar no Firebase |

Enquanto o `firebase-config.js` estiver com `COLE_AQUI`, o site funciona em **modo demo**: qualquer clique em "Entrar" libera o acesso. Use esse modo só para ver como o site fica.

---

## 1. Criar o projeto
1. Entre em **https://console.firebase.google.com** com a sua conta Google.
2. Clique em **Criar um projeto** (ou "Adicionar projeto").
3. Dê um nome ao projeto, por exemplo `pokewiki`, e clique em Continuar.
4. O Google Analytics pode ficar **desativado**. Clique em **Criar projeto**.

## 2. Ativar o login com Google
1. No menu da esquerda, abra **Criação → Authentication** e clique em **Vamos começar**.
2. Na aba **Método de login**, escolha **Google**.
3. Ative a chave, escolha o seu email como "email de suporte" e clique em **Salvar**.
4. Vá na aba **Configurações → Domínios autorizados** e clique em **Adicionar domínio**.
   Coloque o endereço onde o site vai ficar, por exemplo `seuusuario.github.io`.

## 3. Criar o banco de dados (lista de membros)
1. No menu, abra **Criação → Firestore Database** e clique em **Criar banco de dados**.
2. Em local, escolha **southamerica-east1 (São Paulo)**.
3. Escolha **Iniciar no modo de produção** e clique em **Criar**.
4. Abra a aba **Regras**, apague o que estiver lá e cole o conteúdo do arquivo `firestore.rules`.
5. Clique em **Publicar**.

## 4. Conectar o site ao Firebase
1. Clique na **engrenagem ⚙️ → Configurações do projeto**.
2. Desça até **Seus apps** e clique no ícone **`</>`** (Web).
3. Dê um apelido, por exemplo `site`, e clique em **Registrar app**. Não precisa marcar o Hosting.
4. Vai aparecer um bloco `const firebaseConfig = { ... }`. Copie os valores
   (`apiKey`, `authDomain`, `projectId`...) para dentro do `firebase-config.js`.

> A `apiKey` do Firebase pode ficar visível no site, ela é feita para isso. Quem protege os dados são as regras do passo 3.

## 5. Colocar o site no ar (GitHub Pages)
1. Crie uma conta em **https://github.com** e depois um repositório novo, por exemplo `pokewiki`, marcado como **Public**.
2. Clique em **Add file → Upload files** e arraste todos os arquivos desta pasta.
3. Vá em **Settings → Pages**. Em "Branch", escolha **main** e clique em **Save**.
4. Depois de 1 ou 2 minutos, o site fica em `https://seuusuario.github.io/pokewiki/login.html`.
   Esse é o link que você manda para as pessoas.

## 6. Aprovar membros (inclusive você)
Quando alguém entra pela primeira vez, a pessoa aparece no Firebase como **pending** (aguardando aprovação).

1. Abra **Firestore Database → aba Dados → coleção `users`**.
2. Clique no cadastro da pessoa (o email dela aparece nos campos).
3. Passe o mouse no campo `status`, clique no lápis ✏️ e troque o valor:
   - `approved` → libera o acesso
   - `blocked` → bloqueia
   - `pending` → volta para aguardando
4. Clique em **Atualizar**. A pessoa só precisa recarregar o site.

**Na primeira vez**, entre no site você mesma, depois venha aqui e aprove o seu próprio cadastro.

---

## 7. Abas da wiki e onde ficam os dados
| Aba | Arquivo com os dados |
|---|---|
| Pokédex (localizações) | `dados/localizacoes.json` |
| TMs | `dados/tms.json` |
| Atacks, Smeargle e MOVE7 | `dados/movesets.json` |
| Quests | `dados/quests.json` |

Para mudar alguma informação, edite o arquivo no GitHub (abra o arquivo e clique no lápis ✏️) e depois em **Commit changes**.

## 8. Aprovar sugestões da comunidade
Quando alguém clica em **💡 Sugerir**, a sugestão aparece no Firestore, na coleção **sugestoes**, com o status `pending`.
Para ela aparecer no site, troque o `status` para `approved`, do mesmo jeito que você aprova membros.
Na Pokédex, as sugestões aprovadas aparecem no card como **Sugestão da Comunidade**.
