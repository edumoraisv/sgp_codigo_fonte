package br.com.basis.sgp.servico.mapper;

import br.com.basis.sgp.dominio.Questao;
import br.com.basis.sgp.servico.dto.QuestaoDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface QuestaoMapper extends EntityMapper<QuestaoDTO, Questao> {

    @Override
    @Mapping(target = "idSenioridade", source = "senioridade.id")
    @Mapping(target = "idTipoQuestao", source = "tipoQuestao.id")
    QuestaoDTO toDto(Questao usuario);

}
