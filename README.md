# Squad ADS - Iluminacao Publica Inteligente

Prototipo academico de uma central para monitoramento da iluminacao publica, gerenciamento de manutencao e acompanhamento de energia solar em Vicosa - MG.

> Este projeto funciona sem backend. Os dados de postes, sensores, chamados e indicadores sao simulados e ficam armazenados no `localStorage` do navegador.

## Acesso online

[Abrir o sistema no GitHub Pages](https://pereiralp.github.io/squadads-iluminacao-inteligente/)

Repositorio: [github.com/pereiralp/squadads-iluminacao-inteligente](https://github.com/pereiralp/squadads-iluminacao-inteligente)

## Funcionalidades

- Dashboard com indicadores da rede e chamados recentes.
- Mapa inteligente de Vicosa com Leaflet, CARTO e OpenStreetMap.
- Pesquisa de ruas, zoom, marcadores, agrupamento e filtros por estado.
- Mapa ampliado na tela de monitoramento, com os detalhes do poste abaixo do mapa.
- Simulacao de falhas e criacao automatica de chamados.
- Abertura manual de chamados pelo gestor.
- Fluxo de manutencao: aguardando aprovacao, aprovado, em atendimento, pendente de peca, resolvido, rejeitado e cancelado.
- Filtros de chamados por status e prioridade.
- App demonstrativo para o tecnico com checklist e observacoes.
- Indicadores de consumo, geracao solar, economia e emissao de CO2.
- Exportacao de dados em JSON e CSV e impressao dos relatorios.
- Configuracao local de tarifa, emissao de CO2 e tempos de alerta.
- Layout responsivo para computador e dispositivos moveis.

## Perfis de demonstracao

| Perfil | Persona | Senha |
| --- | --- | --- |
| Gestor | Carlos Mendes | `demo123` |
| Tecnico | Rafael Souza | `demo123` |

### Carlos Mendes - Gestor

Precisa acompanhar a rede rapidamente, receber alertas, analisar indicadores, aprovar chamados e comprovar a economia gerada pela iluminacao inteligente.

### Rafael Souza - Tecnico

Precisa localizar os postes, consultar chamados atribuidos, iniciar atendimentos, registrar o checklist e finalizar o servico com poucas etapas.

## Fluxo principal

```text
Falha ou solicitacao manual
          |
          v
Chamado aguardando aprovacao
          |
          v
Gestor aprova e atribui ao tecnico
          |
          v
Tecnico inicia o atendimento
          |
          +--> Pendente de peca --> Retomar atendimento
          |
          v
Checklist e observacoes
          |
          v
Chamado resolvido e poste normalizado
```

## Estrutura do repositorio

```text
squadads-iluminacao-inteligente/
|
|-- index.html              # Estrutura das telas e componentes
|-- css/
|   `-- estilo.css          # Estilos, responsividade e layout do mapa
|-- js/
|   `-- script.js           # Navegacao, dados simulados e interacoes
`-- README.md               # Documentacao do projeto
```

## Tecnologias

- HTML5
- CSS3
- JavaScript puro
- Leaflet.js
- CARTO / OpenStreetMap
- Chart.js
- localStorage
- GitHub Pages

## Como executar localmente

1. Clone ou baixe este repositorio.
2. Abra a pasta no Visual Studio Code.
3. Abra o arquivo `index.html` com o Live Server ou outro servidor local.
4. Use a senha demonstrativa `demo123`.

Tambem e possivel abrir o `index.html` diretamente no navegador. Para carregar o mapa e a busca de ruas, e recomendada uma conexao com a internet.

## Observacoes importantes

- Nao existe autenticacao real: o login e apenas demonstrativo.
- Nao existe banco de dados ou API propria.
- Os dados sao salvos somente no navegador atual.
- O botao **Reiniciar demo** restaura os dados iniciais.
- As coordenadas dos postes sao aproximadas e usadas somente para apresentacao.
- O mapa depende dos servicos externos configurados no projeto.

## Melhorias futuras

- Integracao com sensores IoT reais.
- Backend com banco de dados e autenticacao segura.
- Cadastro oficial de postes e usuarios.
- Sincronizacao em tempo real.
- Rotas de atendimento e geolocalizacao precisa.
- Notificacoes por e-mail ou aplicativo.
- Relatorios gerenciais com dados reais.

## Equipe

Projeto academico desenvolvido pela equipe Squad ADS - 2026.

Curso: Analise e Desenvolvimento de Sistemas (ADS).
