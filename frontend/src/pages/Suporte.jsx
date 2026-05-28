import React, { useState } from "react";
import { MessageSquare, Mail, Phone, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

export default function Suporte() {
  const [faqAberta, setFaqAberta] = useState(null);

  const faqs = [
    {
      id: 1,
      pergunta: "Como funciona a Tiragem Expressa?",
      resposta: "A Tiragem Expressa é um atendimento rápido onde você envia uma pergunta objetiva e o primeiro tarólogo disponível no Círculo responderá por áudio ou texto em até 24 horas."
    },
    {
      id: 2,
      pergunta: "Como reagendar uma sessão ao vivo?",
      resposta: "Para reagendar, acesse a aba 'Tiragens Agendadas', clique nos três pontinhos ao lado da sessão desejada e selecione 'Reagendar'. É necessário fazer isso com pelo menos 12 horas de antecedência."
    },
    {
      id: 3,
      pergunta: "Como acesso os Registros Akáshicos?",
      resposta: "Os Registros Akáshicos guardam o histórico de todas as suas sessões finalizadas. Se você possui o Círculo Premium, pode acessar o resumo e as cartas tiradas a qualquer momento na aba correspondente."
    }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Ajuda & Suporte</h2>
        <p style={styles.subtitle}>Encontre respostas rápidas ou entre em contato com nosso santuário.</p>
      </div>

      <div style={styles.grid}>
        {/* COLUNA ESQUERDA: FAQ */}
        <div style={styles.faqSection}>
          <h3 style={styles.sectionTitle}>Perguntas Frequentes</h3>
          
          <div style={styles.faqList}>
            {faqs.map((faq) => (
              <div 
                key={faq.id} 
                style={styles.faqItem}
                onClick={() => setFaqAberta(faqAberta === faq.id ? null : faq.id)}
              >
                <div style={styles.faqQuestion}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <HelpCircle size={18} color="#D4AF37" />
                    <span style={styles.faqQuestionText}>{faq.pergunta}</span>
                  </div>
                  {faqAberta === faq.id ? <ChevronUp size={16} color="#786C63" /> : <ChevronDown size={16} color="#786C63" />}
                </div>
                
                {faqAberta === faq.id && (
                  <div style={styles.faqAnswer}>
                    <p>{faq.resposta}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* COLUNA DIREITA: CONTATOS */}
        <div style={styles.contactSection}>
          <h3 style={styles.sectionTitle}>Canais de Atendimento</h3>
          
          <div style={styles.contactCard}>
            <div style={styles.contactIconWrapper}><Mail size={20} color="#D4AF37" /></div>
            <div>
              <h4 style={styles.contactName}>Suporte por E-mail</h4>
              <p style={styles.contactDesc}>Respostas em até 48 horas úteis.</p>
              <a href="mailto:suporte@arcanum.com" style={styles.contactLink}>suporte@arcanum.com</a>
            </div>
          </div>

          <div style={styles.contactCard}>
            <div style={styles.contactIconWrapper}><MessageSquare size={20} color="#D4AF37" /></div>
            <div>
              <h4 style={styles.contactName}>WhatsApp Arcanum</h4>
              <p style={styles.contactDesc}>Apenas para problemas técnicos urgentes.</p>
              <a href="#" style={styles.contactLink}>+55 (11) 99999-9999</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { paddingBottom: "40px", animation: "fadeIn 0.3s ease" },
  header: { marginBottom: "40px" },
  title: { color: "#FDFBF7", fontSize: "28px", fontFamily: "'Playfair Display', serif", fontStyle: "italic", marginBottom: "8px" },
  subtitle: { color: "#A89C92", fontSize: "14px" },
  grid: { display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "32px" },
  sectionTitle: { color: "#FDFBF7", fontSize: "18px", fontFamily: "'Playfair Display', serif", marginBottom: "24px" },
  
  faqList: { display: "flex", flexDirection: "column", gap: "16px" },
  faqItem: { backgroundColor: "#151312", border: "1px solid #2A2420", borderRadius: "8px", overflow: "hidden", cursor: "pointer", transition: "border-color 0.2s" },
  faqQuestion: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px" },
  faqQuestionText: { color: "#EAE0C8", fontSize: "14px", fontWeight: "500" },
  faqAnswer: { padding: "0 20px 20px 50px", color: "#A89C92", fontSize: "14px", lineHeight: "1.6" },
  
  contactSection: { display: "flex", flexDirection: "column", gap: "16px" },
  contactCard: { display: "flex", gap: "16px", backgroundColor: "#151312", border: "1px solid #2A2420", borderRadius: "12px", padding: "24px" },
  contactIconWrapper: { width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "rgba(212, 175, 55, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  contactName: { color: "#FDFBF7", fontSize: "15px", fontWeight: "500", marginBottom: "4px" },
  contactDesc: { color: "#786C63", fontSize: "12px", marginBottom: "12px" },
  contactLink: { color: "#D4AF37", fontSize: "14px", textDecoration: "none", fontWeight: "600" }
};