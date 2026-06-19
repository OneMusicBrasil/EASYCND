export interface CertificateTemplate {
  id: string;
  name: string;
  description: string;
  scope: 'federal' | 'state' | 'municipal';
  defaultUrl: string;
}

export const CERTIFICATE_TEMPLATES: CertificateTemplate[] = [
  {
    id: 'cnpj',
    name: 'Espelho do CNPJ',
    description: 'Comprovante de Inscrição e de Situação Cadastral da Receita Federal.',
    scope: 'federal',
    defaultUrl: 'https://solucoes.receita.fazenda.gov.br/servicos/cnpjreva/cnpjreva_solicitacao.asp'
  },
  {
    id: 'inscricao_estadual',
    name: 'Prova de Inscrição Estadual (CADESP)',
    description: 'Comprovante de inscrição no Cadastro de Contribuintes do Estado (SP).',
    scope: 'state',
    defaultUrl: 'https://www.cadesp.fazenda.sp.gov.br/(S(wxfk3qibpbvi354ogocgyfau))/Pages/Cadastro/Consultas/ConsultaPublica/ConsultaPublica.aspx'
  },
  {
    id: 'inscricao_municipal',
    name: 'Prova de Inscrição Municipal',
    description: 'Inscrição no Cadastro de Contribuintes Mobiliários (Poder Público Municipal).',
    scope: 'municipal',
    defaultUrl: 'https://saosebastiao.iibr.com.br/login.php'
  },
  {
    id: 'federal',
    name: 'Certidão Negativa Federal',
    description: 'Certidão de Débitos Relativos a Créditos Tributários Federais e à Dívida Ativa da União.',
    scope: 'federal',
    defaultUrl: 'https://servicos.receitafederal.gov.br/servico/certidoes/#/home/cnpj'
  },
  {
    id: 'fgts',
    name: 'Certidão Negativa do FGTS',
    description: 'Certificado de Regularidade do FGTS - CRF emitida pela Caixa Econômica.',
    scope: 'federal',
    defaultUrl: 'https://consulta-crf.caixa.gov.br/consultacrf/pages/consultaEmpregador.jsf'
  },
  {
    id: 'trabalhista',
    name: 'Certidão Negativa Trabalhista',
    description: 'Certidão Negativa de Débitos Trabalhistas (CNDT) emitida pelo TST.',
    scope: 'federal',
    defaultUrl: 'https://cndt-certidao.tst.jus.br/inicio.faces'
  },
  {
    id: 'falencia',
    name: 'Certidão de Falência Estadual',
    description: 'Certidão de Distribuição de Falências, Concordatas e Recuperações Judiciais.',
    scope: 'state',
    defaultUrl: 'https://esaj.tjsp.jus.br/sco/abrirCadastro.do'
  },
  {
    id: 'debitos_inscritos',
    name: 'Certidão de Débitos Inscritos (Estadual SP)',
    description: 'Certidão de Regularidade Fiscal de Débitos Tributários Inscritos na Dívida Ativa de SP.',
    scope: 'state',
    defaultUrl: 'https://www.dividaativa.pge.sp.gov.br/sc/pages/crda/emitirCrda.jsf'
  },
  {
    id: 'debitos_nao_inscritos',
    name: 'Certidão de Débitos Não Inscritos (Estadual SP)',
    description: 'Certidão de Débitos Estaduais Não Inscritos emitida pela Secretaria da Fazenda de SP.',
    scope: 'state',
    defaultUrl: 'https://www10.fazenda.sp.gov.br/CertidaoNegativaDeb/Pages/EmissaoCertidaoNegativa.aspx'
  },
  {
    id: 'municipal',
    name: 'Certidão Negativa Municipal',
    description: 'Certidão de Débitos Tributários Mobiliários e Imobiliários da Prefeitura da cidade sede.',
    scope: 'municipal',
    defaultUrl: 'https://saosebastiao.iibr.com.br/pub/pub_dashboard.php#pub_certidao_debito$$MjlhY2NkMzMzZmQ5OTUzYjk2NDZjODY5MTM3Zjk3MDdNamxoWTJOa016TXpabVE1T1RVellqazJORFpqT0RZNU1UTTNaamszTURjMU53PT0=$$li_57_2$$2'
  }
];
