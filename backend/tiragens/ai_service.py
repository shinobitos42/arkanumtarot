import time
import threading
from google import genai
from google.genai import types
from django.conf import settings
from .models import Sessao, Mensagem, RegistroAkashico

# COLOQUE SUA CHAVE AQUI DENTRO DAS ASPAS:
API_KEY = "AIzaSyDYm6jxPlW4rGpwTDzhCf_J8m5Z7pkK6n4"


def gerar_resumo_gemini(sessao_id):
    time.sleep(5) 
    
    try:
        sessao = Sessao.objects.get(id=sessao_id)
        registro = sessao.registro_akashico
        mensagens = Mensagem.objects.filter(sessao=sessao).order_by('criado_em')
        
        # 1. INSTRUÇÕES RÍGIDAS (O Prompt Anti-Alucinação)
        prompt_instrucoes = f"""
        Você é o Concierge Espiritual do Arcanum, uma plataforma mística premium de Tarot.
        Abaixo está o histórico de uma consulta. Sua tarefa é criar um Resumo Akáshico final.

        REGRAS ABSOLUTAS:
        1. Baseie seu resumo EXCLUSIVAMENTE nas informações trocadas no chat e nas imagens/áudios. Não invente cartas. Se houver uma imagem de cartas, identifique-as visualmente para compor o resumo.
        2. Se o chat for apenas testes (ex: "sdfgsdfg") e NÃO houver nenhuma leitura identificável, responda EXATAMENTE: "Não foi possível gerar um resumo espiritual pois não houve uma leitura de cartas identificável nesta sessão."
        3. Se houver leitura real, escreva 2 parágrafos: 1º com o diagnóstico das cartas; 2º com o conselho prático.
        4. Tom: Acolhedor, místico e direto. Sem saudações.
        
        DADOS DA SESSÃO:
        Pergunta original: {sessao.pergunta_principal}
        Contexto: {sessao.contexto}

        HISTÓRICO DA CONSULTA E ARQUIVOS:
        """
        
        # Inicializa o cliente na nova SDK unificada
        client = genai.Client(api_key=API_KEY)
        conteudo_para_ia = [prompt_instrucoes]
        
        # Processamento de imagem com a nova SDK
        if sessao.imagem_anexa:
            try:
                with open(sessao.imagem_anexa.path, 'rb') as f:
                    img_bytes = f.read()
                conteudo_para_ia.append(
                    types.Part.from_bytes(
                        data=img_bytes,
                        mime_type="image/jpeg"
                    )
                )
                conteudo_para_ia.append("IMAGEM DA MESA DE TAROT (Analise as cartas visíveis nesta foto):")
            except Exception as e:
                print(f"Erro ao ler imagem da sessão {sessao_id}: {e}")

        # Processamento de áudios e textos
        for msg in mensagens:
            nome = msg.remetente.first_name
            if msg.tipo == 'texto' and msg.texto:
                conteudo_para_ia.append(f"{nome} digitou: {msg.texto}")
            
            elif msg.tipo == 'audio' and msg.arquivo_audio:
                try:
                    uploaded_file = client.files.upload(file=msg.arquivo_audio.path)
                    conteudo_para_ia.append(f"{nome} enviou este áudio:")
                    conteudo_para_ia.append(uploaded_file)
                except Exception as e:
                    print(f"Erro ao subir áudio: {e}")

        print("[INFO GEMINI] Invocando o modelo: gemini-2.5-flash...")
        
        # Geração de conteúdo usando a sintaxe moderna da SDK
        resposta = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=conteudo_para_ia,
        )
        
        registro.resumo_leitura = resposta.text
        registro.processando_ia = False
        registro.save()
        
        print(f"\n[SUCESSO] Resumo do Gemini gerado para a sessão {sessao_id}!\n")
        
    except Exception as e:
        print(f"\n[ERRO GEMINI] A IA falhou na sessão {sessao_id}. Motivo: {e}\n")
        registro = RegistroAkashico.objects.get(sessao_id=sessao_id)
        registro.processando_ia = False
        registro.resumo_leitura = "A energia desta sessão estava muito densa para ser transcrita pela IA..."
        registro.save()

def iniciar_processamento_akashico(sessao_id):
    thread = threading.Thread(target=gerar_resumo_gemini, args=(sessao_id,))
    thread.start()