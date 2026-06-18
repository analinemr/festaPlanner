/**
 * SERVIÇO: Catálogo de Produtos e Serviços
 *
 * Responsável por todas as operações HTTP com o backend Spring Boot
 * relacionadas ao catálogo de itens disponíveis para orçamento.
 *
 * Endpoints Spring Boot esperados:
 *   GET    /api/catalogo          → Lista todos os itens ativos
 *   GET    /api/catalogo/:id      → Busca item por ID
 *   GET    /api/catalogo/categoria/:cat → Filtra por categoria
 *   POST   /api/catalogo          → Cria novo item (admin)
 *   PUT    /api/catalogo/:id      → Atualiza item (admin)
 *   DELETE /api/catalogo/:id      → Remove item (admin)
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Catalogo } from '../../models/catalogo';
import { environment } from '../../../environments/environment';

@Injectable({
  /* 'root' = serviço disponível em toda a aplicação sem precisar declarar em módulos */
  providedIn: 'root'
})
export class CatalogoService {

  /**
   * URL base da API Spring Boot — definida em environment.ts
   * Ex: http://localhost:8080/api/catalogo (desenvolvimento)
   *     https://meudominio.com/api/catalogo (produção)
   */
  private apiUrl = `${environment.apiUrl}/catalogo`;

  /**
   * HttpClient é injetado automaticamente pelo Angular (DI)
   * Usado para fazer requisições HTTP ao backend Spring Boot
   */
  constructor(private http: HttpClient) {}

  /**
   * Lista todos os itens do catálogo ativos
   * Retorna Observable<Catalogo[]> — o componente se inscreve com .subscribe()
   */
  listarTodos(): Observable<Catalogo[]> {
    return this.http.get<Catalogo[]>(this.apiUrl);
  }

  /**
   * Busca itens filtrados por categoria
   * @param categoria - Ex: 'buffet', 'bolo', 'decoracao', 'musica'
   */
  listarPorCategoria(categoria: string): Observable<Catalogo[]> {
    /* HttpParams constrói os query params: /api/catalogo/categoria/buffet */
    return this.http.get<Catalogo[]>(`${this.apiUrl}/categoria/${categoria}`);
  }

  /**
   * Busca um item específico pelo ID
   * @param id - ID do item no banco MySQL
   */
  buscarPorId(id: number): Observable<Catalogo> {
    return this.http.get<Catalogo>(`${this.apiUrl}/${id}`);
  }

  /**
   * Cria um novo item no catálogo (somente admin autenticado)
   * Envia FormData para suportar upload de imagem junto ao objeto
   * @param item - Dados do produto/serviço
   * @param imagem - Arquivo de imagem (opcional)
   */
  criar(item: Catalogo, imagem?: File): Observable<Catalogo> {
    /* FormData permite enviar texto + arquivo na mesma requisição */
    const formData = new FormData();

    /* Converte o objeto para JSON e adiciona ao FormData */
    formData.append('catalogo', new Blob([JSON.stringify(item)], { type: 'application/json' }));

    /* Adiciona a imagem apenas se foi selecionada */
    if (imagem) {
      formData.append('imagem', imagem, imagem.name);
    }

    return this.http.post<Catalogo>(this.apiUrl, formData);
  }

  /**
   * Atualiza um item existente (somente admin autenticado)
   * @param id - ID do item a atualizar
   * @param item - Novos dados do item
   * @param imagem - Nova imagem (opcional)
   */
  atualizar(id: number, item: Catalogo, imagem?: File): Observable<Catalogo> {
    const formData = new FormData();
    formData.append('catalogo', new Blob([JSON.stringify(item)], { type: 'application/json' }));

    if (imagem) {
      formData.append('imagem', imagem, imagem.name);
    }

    return this.http.put<Catalogo>(`${this.apiUrl}/${id}`, formData);
  }

  /**
   * Remove um item do catálogo (somente admin autenticado)
   * @param id - ID do item a remover
   */
  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
