// Mapeia os campos retornados pela API para o schema local de cada entidade
export function mapApiFields(apiEntity, item) {
  switch (apiEntity) {
    case 'users':
      return {
        user_app_id: item.id,
        home_user: item.nome || '',
        senha: item.senha || '',
        ine: item.ine != null ? String(item.ine) : '',
        ativo: item.ativo ?? true,
        cpf: item.cpf || '',
        teste: item.teste ?? false,
        id_user_api: item.id,
      };
    case 'unidades':
      return {
        unidade_id: item.id,
        id_instituicao: item.idInstuicao ?? item.id_instituicao,
        cnes: item.cnes != null ? String(item.cnes) : '',
        nome_unidade: item.nome || '',
        id_unidade_api: item.id,
      };
    case 'equipes':
      return {
        equipe_id: item.id,
        cnes: item.cnes != null ? String(item.cnes) : '',
        ine: item.ine != null ? String(item.ine) : '',
        descricao: item.descricao || '',
      };
    case 'instituicoes':
      return {
        instituicao_id: item.id,
        nome: item.nome || '',
        telefone: item.telefone || '',
        email: item.email || '',
        endereco: item.endereco || '',
      };
    case 'questionarios':
      return {
        questionario_id: item.id,
        id_user: item.userId,
        responsavel: item.responsavel || '',
        endereco: item.endereco || '',
        data: item.data || '',
        id_user_app: item.prontuario || '',
        acamado: item.acamado_Qtde ?? 0,
        def_fisico: item.def_Fisica_Qtde ?? 0,
        def_mental: item.def_Mental_Qtde ?? 0,
        saneamento: item.saneamento_Qtde ?? 0,
        desnutricao: item.desnutricao_Qtde ?? 0,
        drogadicao: item.drogadicacao_Qtde ?? 0,
        desemprego: item.desemprego_Qtde ?? 0,
        analfabetismo: item.analfabetismo_Qtde ?? 0,
        menor6meses: item.menor6Meses_Qtde ?? 0,
        maior70: item.maior70Anos_Qtde ?? 0,
        hipertensao: item.hipertensao_Qtde ?? 0,
        diabetes: item.diabetes_Qtde ?? 0,
        comodo_maior1: item.comodoMaior1_Qtde ?? 0,
        comodo_igual1: item.comodoIgual1_Qtde ?? 0,
        comodo_menor1: item.comodoMenor1_Qtde ?? 0,
        risco: item.risco != null ? String(item.risco) : '',
      };
    default:
      return item;
  }
}