import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'src/app/components/alert/alert.service';
import { LoadingService } from 'src/app/components/loading/loading.service';
import { Questao } from '../../questao/models/questao';
import { QuestaoService } from '../../questao/service/questao.service';
import { Prova } from '../models/prova';
import { ProvaService } from '../service/prova.service';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cadastrar-prova',
  templateUrl: './cadastrar-prova.component.html',
  styleUrls: ['./cadastrar-prova.component.css'],
})
export class CadastrarProvaComponent implements OnInit {
  formulario: FormGroup;
  prova: Prova = new Prova();
  formSubmetido: boolean = false;
  @Input() provaSendoEditada: Prova;
  @Input() apenasVisualizar = false;
  @Output() salvar = new EventEmitter();
  @Output() cancelar = new EventEmitter();
  visible = false;
  visualizando: boolean;
  edicao: boolean;
  modoDialog: number;

  @Output() retornarProva = new EventEmitter();

  origemQuestoes: Questao[];
  destinoQuestoes: Questao[];
  totalDeQuestoes = 0;

  exibir = false;

  constructor(
    private formBuilder: FormBuilder,
    private provaService: ProvaService,
    private alert: AlertService,
    private loadingService: LoadingService,
    private questaoService: QuestaoService,
    private router: Router
  ) { }

  ngOnInit() {

    this.iniciarForm();

    this.questaoService.index().subscribe((questoes) => {
      this.origemQuestoes = questoes;
      this.destinoQuestoes = [];
    });

    this.questaoService
      .getNumberOfElements()
      .subscribe((total) => (this.totalDeQuestoes = total));

    this.formulario = this.formBuilder.group({
      titulo: ['', Validators.required],
      percentualAprovacao: ['', Validators.required],
    });
  }

  iniciarForm() {
    this.formulario = this.formBuilder.group(
      {
        titulo: [this.prova.titulo, [Validators.required]],
        percentualAprovacao: [this.prova.percentualAprovacao, [Validators.required]],
      },
      { updateOn: "blur" }
    );
  }

  validarForm() {

    if (this.formulario.invalid) {
      this.alert.montarAlerta('error', 'Erro', 'Preenchimento obrigatório dos campos: titulo e Percentual de Aprovação');
      return;
    }

    this.persistir();

  }

  persistir() {
   if (this.prova.id === null) {
     this.salvarProva(this.prova);
   } else {
     this.atualizarProva(this.prova);
   }
  }

  salvarProva(prova: Prova): void {
    this.provaService.create(prova).subscribe(
      () => {
        this.loadingService.deactivate();
        this.formulario.reset();
        this.alert.montarAlerta(
          'success',
          'Sucesso!',
          'Prova cadastrada com suscesso!'
        );
      },
      (err) => {
        this.alert.montarAlerta('error', 'Error!', 'Erro ao salvar a Prova');
      }
    );
  }

  atualizarProva(prova: Prova): void {
    this.provaService.update(prova).subscribe(
      () => {
        this.loadingService.deactivate();
        this.formulario.reset();
        this.alert.montarAlerta(
          'success',
          'Sucesso!',
          'Prova atualizada com suscesso!'
        );
      },
      (err) => {
        this.alert.montarAlerta('error', 'Error!', 'Erro ao atualizar a Prova');
      }
    );
  }

  getTitulo(): string {
    if (this.visualizando) {
      return 'Visualizar Prova';
    } else if (this.edicao) {
      return 'Editar Prova';
    } else {
      return 'Cadastrar Prova';
    }
  }

  get inputSize(): number {
    const inputTitulo = this.formulario.get('titulo').value;
    return inputTitulo ? inputTitulo.length : 20;
  }

  get isFormValid(): boolean {
    const percentualAprovacao = +this.formulario.get('percentualAprovacao')
      .value;

    return (
      this.formulario.valid &&
      this.destinoQuestoes.length > 0 &&
      percentualAprovacao <= 100 &&
      percentualAprovacao >= 0
    );
  }



  preencherFormParaEdicao(): void {
    this.formulario.get('titulo').setValue(this.provaSendoEditada.titulo);
    this.formulario
      .get('percentualDeAprovacao')
      .setValue(this.provaSendoEditada.percentualAprovacao);
    this.questaoService.index().subscribe((questoes) => {
      this.destinoQuestoes = questoes;
    });
  }

  abrirDialog(prova: Prova, apenasVisualizar = false): void {
    this.prova = Object.assign({}, prova);
    this.apenasVisualizar = apenasVisualizar;
    this.visible = true;
  }

/*   abrirDialog(modo): void {
    if (modo === 1) {
      this.edicao = false;
      this.visualizando = false;
      this.exibir = true;
      // novo
    } else if (modo === 2) {
      this.edicao = true;
      this.visualizando = false;
      this.exibir = true;
      this.provaService.show(this.prova.id).subscribe((prova) => {
        this.provaSendoEditada = prova;
      });
      this.preencherFormParaEdicao();
      this.formulario.get('titulo').enable();
      this.formulario.get('percentualAprovacao').enable();
      // ediçao
    } else {
      this.visualizando = true;
      this.edicao = false;
      this.exibir = true;
      this.provaService.show(this.prova.id).subscribe((prova) => {
        this.provaSendoEditada = prova;
      });
      this.preencherFormParaEdicao();
      this.formulario.get('titulo').disable();
      this.formulario.get('percentualAprovacao').disable();
      //visualizar
    }
    if (this.modoDialog > 1) {
      this.provaService.show(this.prova.id).subscribe((prova) => {
        this.provaSendoEditada = prova;
      });
      this.preencherFormParaEdicao();
      if (this.modoDialog === 3) {
        this.formulario.get('titulo').disable();
        this.formulario.get('percentualAprovacao').disable();
      }
    }
  } */



 /*  onSubmit(): void {
    this.loadingService.activate();
    if (!this.provaSendoEditada) {
      this.salvarProva({
        ...this.formulario.value,
        questoes: this.destinoQuestoes,
      });
    } else {
      this.atualizarProva({
        ...this.formulario.value,
        questoes: this.destinoQuestoes,
        id: this.provaSendoEditada.id,
      });
    }
    this.onCancel();

    this.retornarProva.emit(null);
    this.exibir = false;
  } */

  paginate(event): void {}

  removeRepetitions(arr: any[]): Array<Questao> {
    return arr.filter((questao, i) => arr.indexOf(questao) === i);
  }

  onMoveToTarget(): void {
    this.destinoQuestoes = this.removeRepetitions(this.destinoQuestoes);
  }

  onCancel(): void {
    this.provaSendoEditada = undefined;
    this.exibir = false;
  }
}
