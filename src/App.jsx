import React, { useState } from 'react'
import {
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bug,
  Check,
  ChevronRight,
  CircleCheck,
  ClipboardCheck,
  Code2,
  Database,
  Github,
  Globe2,
  Layers3,
  Linkedin,
  Mail,
  Menu,
  Network,
  ShieldAlert,
  ShieldCheck,
  TerminalSquare,
  X,
} from 'lucide-react'

const socialLinks = [
  {
    label: 'GitHub',
    icon: Github,
    href: import.meta.env.VITE_GITHUB_URL || 'https://supreme-guacamole-7vrjjxv6p5g92p7w7-5173.app.github.dev/#github',
  },
  {
    label: 'LinkedIn',
    icon: Linkedin,
    href: import.meta.env.VITE_LINKEDIN_URL,
  },
  {
    label: 'E-mail',
    icon: Mail,
    href: import.meta.env.VITE_CONTACT_EMAIL
      ? `mailto:${import.meta.env.VITE_CONTACT_EMAIL}`
      : undefined,
  },
]

const toolGroups = [
  {
    title: 'Automação de testes',
    icon: TerminalSquare,
    tools: ['Playwright', 'Selenium WebDriver', 'Cypress', 'Appium'],
  },
  {
    title: 'Linguagens',
    icon: Code2,
    tools: ['Python', 'Java', 'JavaScript', 'TypeScript'],
  },
  {
    title: 'API & performance',
    icon: Network,
    tools: ['Postman', 'Insomnia', 'RestAssured'],
  },
  {
    title: 'Dados & infraestrutura',
    icon: Database,
    tools: ['SQL', 'PostgreSQL', 'Oracle', 'Docker', 'CI/CD', 'Git'],
  },
]

const projects = [
  {
    number: '01',
    type: 'PROJETO PRÓPRIO',
    title: 'Spectrum Key',
    description:
      'Monitoramento contínuo de acessibilidade web e auditoria de vulnerabilidades, com relatórios de conformidade e testes de resiliência.',
    stack: ['Python', 'FastAPI', 'Flask', 'Playwright', 'Selenium'],
    icon: Globe2,
    accent: 'mint',
    metric: 'Acessibilidade + segurança',
    href: import.meta.env.VITE_SPECTRUM_URL,
  },
  {
    number: '02',
    type: 'SETOR PÚBLICO',
    title: 'Censo Previdenciário',
    description:
      'Qualidade e automação para plataformas de gestão previdenciária e análise documental em Jucurutu e Olho d’Água do Borges.',
    stack: ['Python', 'Playwright', 'PostgreSQL', 'REST APIs'],
    icon: ClipboardCheck,
    accent: 'blue',
    metric: 'Integridade de dados públicos',
    href: import.meta.env.VITE_CENSUS_URL,
  },
  {
    number: '03',
    type: 'FRAMEWORK DE QA',
    title: 'Checkout Rules',
    description:
      'Framework de qualidade para checkout, com cenários E2E, análise de valor limite e evidências. Este repositório inclui a suíte executável em Selenium e Pytest.',
    stack: ['Cypress', 'JavaScript', 'Playwright', 'Python', 'Allure Reports'],
    icon: ShieldCheck,
    accent: 'orange',
    metric: '8 cenários de regressão',
    href: '#bug-evidence',
    internal: true,
  },
]

const methods = [
  {
    number: '01',
    title: 'Análise de valor limite',
    description:
      'BVA, partições de equivalência e testes negativos em pontos onde uma regra pode gerar impacto financeiro.',
    icon: Layers3,
  },
  {
    number: '02',
    title: 'Evidência acionável',
    description:
      'Screenshots anotados, logs de rede em JSON, resultado esperado versus obtido e rastreabilidade com BDD/Cucumber.',
    icon: Network,
  },
  {
    number: '03',
    title: 'Regra de negócio primeiro',
    description:
      'Validação de domínios críticos: e-commerce, finanças quantitativas e sistemas públicos.',
    icon: ShieldCheck,
  },
]

const bugPayload = {
  cart_id: 'cart_demo_987654',
  coupon_code: 'VIP20',
  subtotal: 50.0,
  expected: {
    status: 'rejected',
    reason: 'minimum_purchase_not_met',
    discount_amount: 0.0,
    final_total: 50.0,
  },
  observed_example: {
    status: 'success',
    discount_percentage: 20,
    discount_amount: 10.0,
    final_total: 40.0,
  },
}

function SocialLink({ link, compact = false }) {
  const Icon = link.icon

  if (!link.href) {
    return (
      <span
        className={compact ? 'social-icon is-unavailable' : 'social-link is-unavailable'}
        title={`Configure ${link.label} em .env.local`}
        aria-label={`${link.label}: configure a URL em .env.local`}
      >
        <Icon size={compact ? 17 : 16} aria-hidden="true" />
        {!compact && <span>{link.label}</span>}
      </span>
    )
  }

  return (
    <a
      className={compact ? 'social-icon' : 'social-link'}
      href={link.href}
      target={link.label === 'E-mail' ? undefined : '_blank'}
      rel={link.label === 'E-mail' ? undefined : 'noreferrer'}
      aria-label={compact ? link.label : undefined}
    >
      <Icon size={compact ? 17 : 16} aria-hidden="true" />
      {!compact && <span>{link.label}</span>}
    </a>
  )
}

function SectionHeading({ eyebrow, title, description, index }) {
  return (
    <div className="section-heading">
      <div>
        <div className="eyebrow"><span>{index}</span>{eyebrow}</div>
        <h2>{title}</h2>
      </div>
      {description && <p className="section-description">{description}</p>}
    </div>
  )
}

function BugEvidence() {
  const [activeTab, setActiveTab] = useState('overview')
  const [copied, setCopied] = useState(false)
  const formattedPayload = JSON.stringify(bugPayload, null, 2)

  async function copyPayload() {
    try {
      await navigator.clipboard.writeText(formattedPayload)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <article className="bug-card">
      <div className="bug-topline">
        <div className="bug-identity">
          <span className="bug-icon"><Bug size={19} aria-hidden="true" /></span>
          <div>
            <span className="micro-label">BUG_CHECKOUT_014</span>
            <h3>Regra de valor mínimo ignorada</h3>
          </div>
        </div>
        <span className="severity"><span />Severidade alta</span>
      </div>

      <p className="bug-summary">
        O cupom <code>VIP20</code> foi aceito em um carrinho de R$ 50,00, embora a regra exija subtotal elegível acima de R$ 100,00.
      </p>

      <div className="bug-tabs" role="tablist" aria-label="Detalhes da evidência">
        <button
          id="bug-tab-overview"
          type="button"
          role="tab"
          aria-selected={activeTab === 'overview'}
          aria-controls="bug-panel-overview"
          onClick={() => setActiveTab('overview')}
        >
          Reprodução
        </button>
        <button
          id="bug-tab-api"
          type="button"
          role="tab"
          aria-selected={activeTab === 'api'}
          aria-controls="bug-panel-api"
          onClick={() => setActiveTab('api')}
        >
          Evidência API
        </button>
      </div>

      {activeTab === 'overview' ? (
        <div id="bug-panel-overview" className="bug-panel" role="tabpanel" aria-labelledby="bug-tab-overview">
          <div className="repro-layout">
            <div className="repro-steps">
              <span className="micro-label">PASSOS PARA REPRODUZIR</span>
              <ol>
                <li><span>01</span>Entrar com uma conta de cliente.</li>
                <li><span>02</span>Adicionar um produto elegível de R$ 50,00.</li>
                <li><span>03</span>Aplicar o cupom VIP20 no checkout.</li>
              </ol>
            </div>
            <div className="comparison">
              <div className="comparison-cell expected">
                <span><CircleCheck size={14} />Esperado</span>
                <strong>Recusar o cupom</strong>
                <small>Desconto R$ 0,00 · Total R$ 50,00</small>
              </div>
              <div className="comparison-cell observed">
                <span><ShieldAlert size={14} />Obtido no relato</span>
                <strong>Cupom aceito</strong>
                <small>Desconto R$ 10,00 · Total R$ 40,00</small>
              </div>
            </div>
          </div>
          <p className="demo-note">Exemplo demonstrativo baseado no relato BUG_CHECKOUT_014. Não representa uma chamada capturada de sistema real.</p>
        </div>
      ) : (
        <div id="bug-panel-api" className="bug-panel" role="tabpanel" aria-labelledby="bug-tab-api">
          <div className="payload-heading">
            <div><span className="status-dot" />POST <code>/api/v1/coupons/validate</code></div>
            <button type="button" className="copy-button" onClick={copyPayload} aria-label="Copiar payload JSON">
              {copied ? <Check size={14} /> : <Code2 size={14} />}
              {copied ? 'Copiado' : 'Copiar JSON'}
            </button>
          </div>
          <pre className="payload-code"><code>{formattedPayload}</code></pre>
          <p className="demo-note">Payload fictício para ilustrar a divergência esperada versus relatada. IDs e valores são dados sintéticos.</p>
        </div>
      )}

      <div className="bug-footer">
        <span><span className="bug-footer-dot" />Regra violada: subtotal &gt; R$ 100,00</span>
        <a href="./bug-reports/BUG014_falha_logica_cupom.md" target="_blank" rel="noreferrer">
          Abrir relatório completo <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      </div>
    </article>
  )
}

function ProjectCard({ project }) {
  const Icon = project.icon
  const isInternal = project.internal
  const cardContent = (
    <>
      <div className="project-topline">
        <span className="project-number">{project.number}</span>
        <span className="project-type">{project.type}</span>
        <Icon className="project-icon" size={21} aria-hidden="true" />
      </div>
      <div className="project-copy">
        <h3>{project.title}</h3>
        <p>{project.description}</p>
      </div>
      <div className="project-metric"><span />{project.metric}</div>
      <div className="tag-list">
        {project.stack.map((tool) => <span className="tech-tag" key={tool}>{tool}</span>)}
      </div>
      <div className="project-link">
        {isInternal ? 'Ver evidência interativa' : project.href ? 'Visitar projeto' : 'Link não informado'}
        <ArrowUpRight size={16} aria-hidden="true" />
      </div>
    </>
  )

  return (
    <article className={`project-card ${project.accent}`}>
      {project.href ? (
        <a className="project-card-link" href={project.href} target={isInternal ? undefined : '_blank'} rel={isInternal ? undefined : 'noreferrer'}>
          {cardContent}
        </a>
      ) : (
        <div className="project-card-link is-placeholder" aria-label={`${project.title}: URL do projeto não configurada`}>
          {cardContent}
        </div>
      )}
    </article>
  )
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <div className="site-shell">
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <header className="site-header">
        <a href="#inicio" className="brand-mark" aria-label="Luiz Fernando Alves, início">
          <span className="brand-symbol">LF<span>.</span></span>
          <span className="brand-divider" />
          <span className="brand-caption">QUALITY<br />ENGINEERING</span>
        </a>
        <button
          type="button"
          className="menu-toggle"
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Navegação principal">
          <a href="#expertise" onClick={closeMenu}>Expertise</a>
          <a href="#projetos" onClick={closeMenu}>Projetos</a>
          <a href="#evidencia" onClick={closeMenu}>Evidência</a>
          <a className="nav-contact" href="#contato" onClick={closeMenu}>Vamos conversar <ArrowUpRight size={15} /></a>
        </nav>
      </header>

      <main id="conteudo">
        <section id="inicio" className="hero-section">
          <div className="hero-grid">
            <div className="hero-copy">
              <div className="availability"><span /> QUALITY-DRIVEN, RISK-AWARE</div>
              <p className="hero-kicker">QA ANALYST <span>·</span> TEST AUTOMATION ENGINEER</p>
              <h1>Luiz Fernando<br /><span>Alves.</span></h1>
              <p className="hero-description">
                Especialista em garantia da qualidade e automação de testes E2E, API e Mobile. Transformo regras de negócio complexas em qualidade verificável, com foco em mitigação de riscos, rastreabilidade e evidências que aceleram decisões.
              </p>
              <div className="hero-actions">
                <a className="button-primary" href="#projetos">Explorar projetos <ArrowDownRight size={17} /></a>
                <a className="button-secondary" href="#contato">Entrar em contato <ArrowRight size={16} /></a>
              </div>
              <div className="hero-socials" aria-label="Links profissionais">
                {socialLinks.map((link) => <SocialLink key={link.label} link={link} />)}
              </div>
            </div>

            <div className="hero-visual" aria-label="Painel ilustrativo de validação de checkout">
              <div className="visual-orbit orbit-one" />
              <div className="visual-orbit orbit-two" />
              <div className="visual-crosshair crosshair-top" />
              <div className="visual-crosshair crosshair-bottom" />
              <div className="terminal-window">
                <div className="terminal-bar">
                  <div className="terminal-controls"><i /><i /><i /></div>
                  <span>coupon.rules.spec.ts</span>
                  <span className="terminal-status"><span />RUNNING</span>
                </div>
                <div className="terminal-body">
                  <div className="code-line"><span className="line-no">01</span><span><b>describe</b>(<em>'VIP20 rules'</em>, () =&gt; {'{'}</span></div>
                  <div className="code-line"><span className="line-no">02</span><span>&nbsp;&nbsp;<b>it</b>(<em>'rejects below minimum'</em>, () =&gt; {'{'}</span></div>
                  <div className="code-line"><span className="line-no">03</span><span>&nbsp;&nbsp;&nbsp;&nbsp;<strong>expect</strong>(subtotal).toBeGreaterThan(<mark>100</mark>)</span></div>
                  <div className="code-line code-gap"><span className="line-no">04</span><span>&nbsp;&nbsp;&nbsp;&nbsp;<strong>expect</strong>(coupon).toBe(<mark>'VIP20'</mark>)</span></div>
                  <div className="code-line"><span className="line-no">05</span><span>&nbsp;&nbsp;{'}'})</span></div>
                  <div className="code-line"><span className="line-no">06</span><span>{'}'})</span></div>
                </div>
                <div className="terminal-result"><CircleCheck size={15} /> 08 assertions passed <span>· 1.42s</span></div>
              </div>
              <div className="visual-label label-top">BUSINESS RULES <span>DEFINED</span></div>
              <div className="visual-label label-bottom"><span className="pulse-dot" /> QUALITY GATE <b>ACTIVE</b></div>
              <div className="hero-index">01 / 04</div>
            </div>
          </div>
          <a className="scroll-cue" href="#expertise"><span>SCROLL TO EXPLORE</span><ArrowDown size={15} /></a>
          <div className="hero-bottomline"><span>QUALITY IS A BUSINESS DECISION</span><span>01 — 04</span></div>
        </section>

        <section id="expertise" className="content-section expertise-section">
          <SectionHeading
            index="01"
            eyebrow="CAPABILITIES"
            title={<>Qualidade é método.<br /><span>Automação é escala.</span></>}
            description="Combino estratégia de testes e engenharia para encontrar riscos cedo, validar o que importa e entregar sinais de qualidade claros para o time."
          />
          <div className="method-grid">
            {methods.map((method) => {
              const Icon = method.icon
              return (
                <article className="method-item" key={method.number}>
                  <div className="method-index">{method.number}</div>
                  <Icon className="method-icon" size={21} aria-hidden="true" />
                  <h3>{method.title}</h3>
                  <p>{method.description}</p>
                  <span className="method-rule" />
                </article>
              )
            })}
          </div>
          <div className="boundary-strip">
            <div className="boundary-title"><span className="micro-label">BOUNDARY VALUE ANALYSIS</span><strong>O erro costuma morar<br />na fronteira.</strong></div>
            <div className="boundary-values">
              <div className="boundary-value rejected"><span>R$ 99,99</span><small><X size={12} /> RECUSAR</small></div>
              <div className="boundary-value exact"><span>R$ 100,00</span><small><X size={12} /> RECUSAR</small></div>
              <div className="boundary-value accepted"><span>R$ 100,01</span><small><Check size={12} /> APROVAR</small></div>
            </div>
            <div className="boundary-rule"><span>REGRA</span> subtotal elegível <b>&gt;</b> R$ 100,00</div>
          </div>
        </section>

        <section className="content-section stack-section">
          <SectionHeading
            index="02"
            eyebrow="TOOLKIT"
            title={<>Ferramentas para<br /><span>qualidade em movimento.</span></>}
            description="Uma stack orientada ao problema: do teste de interface à validação de dados, API e infraestrutura."
          />
          <div className="tool-grid">
            {toolGroups.map((group, groupIndex) => {
              const Icon = group.icon
              return (
                <article className="tool-group" key={group.title} style={{ '--group-index': groupIndex }}>
                  <div className="tool-group-heading"><Icon size={18} /><h3>{group.title}</h3><span>0{groupIndex + 1}</span></div>
                  <div className="tool-badges">
                    {group.tools.map((tool) => <span className="tool-badge" key={tool}>{tool}</span>)}
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section id="projetos" className="content-section projects-section">
          <SectionHeading
            index="03"
            eyebrow="SELECTED WORK"
            title={<>Projetos com qualidade<br /><span>no centro da entrega.</span></>}
            description="Experiências em automação, acessibilidade e sistemas onde confiabilidade e integridade de dados são essenciais."
          />
          <div className="project-grid">
            {projects.map((project) => <ProjectCard key={project.number} project={project} />)}
          </div>
          <p className="project-disclaimer">Links externos são habilitados quando URLs públicas são configuradas. Descrições refletem os projetos informados para este portfólio.</p>
        </section>

        <section id="evidencia" className="content-section evidence-section">
          <SectionHeading
            index="04"
            eyebrow="QUALITY IN ACTION"
            title={<>Um bug. Uma regra.<br /><span>Evidência que explica.</span></>}
            description="Um exemplo interativo de como reportar uma falha financeira com passos reproduzíveis, impacto visível e contexto técnico."
          />
          <div id="bug-evidence" className="evidence-layout">
            <div className="evidence-intro">
              <span className="evidence-stamp"><Bug size={15} /> INCIDENT REPORT / DEMO</span>
              <h3>Do sintoma à<br /><span>causa provável.</span></h3>
              <p>Um bom relatório elimina ambiguidade. A equipe consegue comparar o comportamento observado com a regra esperada antes mesmo de abrir o código.</p>
              <div className="evidence-checklist">
                <div><Check size={14} />Contexto e severidade</div>
                <div><Check size={14} />Passos para reproduzir</div>
                <div><Check size={14} />Payload de referência</div>
              </div>
              <a href="./bug-reports/BUG014_falha_logica_cupom.md" target="_blank" rel="noreferrer" className="text-link">Ler relatório completo <ArrowUpRight size={15} /></a>
            </div>
            <BugEvidence />
          </div>
        </section>

        <section className="closing-band">
          <div className="closing-pattern" aria-hidden="true" />
          <div className="closing-content">
            <span className="eyebrow"><span>05</span> NEXT CONVERSATION</span>
            <h2>Vamos construir<br /><span>confiança no produto.</span></h2>
            <p>Aberto a conversas sobre Quality Engineering, automação e desafios de produto com impacto real.</p>
            <div className="closing-actions">
              <a className="button-primary" href="#contato">Conectar <ArrowUpRight size={16} /></a>
              <a className="button-secondary" href="#projetos">Ver projetos <ChevronRight size={16} /></a>
            </div>
          </div>
          <div className="closing-coordinate">LAT 05° 46' S<br />LONG 36° 39' W</div>
        </section>
      </main>

      <footer id="contato" className="site-footer">
        <div className="footer-main">
          <div className="footer-name"><span className="brand-symbol">LF<span>.</span></span><p>Luiz Fernando Alves<br /><small>QA Analyst & Test Automation Engineer</small></p></div>
          <div id="github" className="footer-contact"><span className="micro-label">CONTATO PROFISSIONAL</span><div className="footer-socials">{socialLinks.map((link) => <SocialLink key={link.label} link={link} />)}</div></div>
          <a href="#inicio" className="back-top" aria-label="Voltar ao início"><ArrowDown size={16} /></a>
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} Luiz Fernando Alves</span><span>BUILT WITH QUALITY IN MIND <span className="footer-signal">●</span></span><span>BRASIL · RN</span></div>
      </footer>
    </div>
  )
}
