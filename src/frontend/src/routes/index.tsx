import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  ChevronRight,
  Layers,
  Settings2,
  ShoppingCart,
  Wrench,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Choose Your Environment",
    desc: "Select from Indian Garage or Indian Fuel Station diorama systems at 1:64 scale.",
    icon: Layers,
  },
  {
    step: "02",
    title: "Configure Your Kit",
    desc: "Pick your base, walls, and accessories. Watch the 3D preview update in real time.",
    icon: Settings2,
  },
  {
    step: "03",
    title: "Review Your BOM",
    desc: "A complete bill of materials is generated automatically from your selections.",
    icon: Wrench,
  },
  {
    step: "04",
    title: "Order the Complete Kit",
    desc: "Add the entire configured kit to your cart and check out in one transaction.",
    icon: ShoppingCart,
  },
];

const WHY_MODULAR = [
  {
    title: "No Blind Buying",
    desc: "See exactly what you're building before you order. Every module is visible in the configurator.",
  },
  {
    title: "Scale-Accurate",
    desc: "Every component is designed specifically for 1:64 die-cast collections. No compromise.",
  },
  {
    title: "Collector-First Design",
    desc: "Built by collectors, for collectors. Crisp detail, authentic materials, premium finish.",
  },
  {
    title: "One Kit, One Order",
    desc: "The full BOM ships together. No hunting for individual parts across multiple suppliers.",
  },
];

export function HomePage() {
  return (
    <>
      {/* Hero */}
      <section
        data-ocid="home.hero_section"
        className="relative overflow-hidden bg-background"
        style={{ minHeight: "calc(100vh - 4rem)" }}
      >
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-diorama.dim_1400x800.jpg')",
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/20 to-background" />

        <div className="relative container mx-auto px-4 flex flex-col items-center justify-center text-center pt-24 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 font-mono text-xs text-primary mb-6">
              <Zap className="w-3 h-3" />
              1:64 Scale &bull; Indian Garage &bull; Indian Fuel Station
            </span>
          </motion.div>

          <motion.h1
            className="font-display text-5xl md:text-7xl font-bold text-foreground leading-[1.05] tracking-tight mb-6"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
          >
            Build Your <span className="text-primary">Scale World</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            Configure modular diorama kits for your scale models and buy the
            complete setup in one go.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link to="/builder">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-display font-semibold px-8 gap-2 transition-smooth"
                data-ocid="home.start_building_button"
              >
                <Settings2 className="w-4 h-4" />
                Start Building
              </Button>
            </Link>
            <Link to="/shop">
              <Button
                size="lg"
                variant="outline"
                className="border-border hover:border-primary/50 hover:bg-primary/10 hover:text-primary font-display font-semibold px-8 gap-2 transition-smooth"
                data-ocid="home.explore_kits_button"
              >
                Explore Kits
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* What is MyScaledWorld */}
      <section
        data-ocid="home.about_section"
        className="bg-muted/30 border-y border-border py-20"
      >
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="font-mono text-xs text-primary uppercase tracking-widest mb-4 block">
              What is MyScaledWorld?
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-5">
              The modular diorama system
              <br />
              <span className="text-primary">built for collectors</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              MyScaledWorld is an e-commerce platform where scale model
              collectors assemble modular diorama kits instead of buying
              accessories blindly. Choose your environment, configure every
              module, preview the scene, and order the complete kit — all from a
              single configurator.
            </p>
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section
        data-ocid="home.how_it_works_section"
        className="bg-background py-20"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="font-mono text-xs text-primary uppercase tracking-widest mb-3 block">
              The Process
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4"
                data-ocid={`home.how_it_works_card.item.${i + 1}`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-primary/60">
                    {item.step}
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <h3 className="font-display text-sm font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Diorama Systems */}
      <section
        data-ocid="home.featured_systems_section"
        className="bg-muted/30 border-y border-border py-20"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="font-mono text-xs text-primary uppercase tracking-widest mb-3 block">
              1:64 Scale
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Featured Diorama Systems
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              {
                name: "Indian Garage",
                desc: "Workshop floors, corrugated walls, lifts, tool cabinets and more. Build the garage scene your die-casts deserve.",
                modules: ["3 Floor Modules", "3 Wall Modules", "6 Accessories"],
                ocid: "home.featured_garage_card",
              },
              {
                name: "Indian Fuel Station",
                desc: "Forecourt bases, canopies, fuel pumps, signage and safety barriers. The complete roadside experience.",
                modules: [
                  "2 Forecourt Bases",
                  "2 Canopy Structures",
                  "5 Accessories",
                ],
                ocid: "home.featured_fuelstation_card",
              },
            ].map((system, i) => (
              <motion.div
                key={system.name}
                initial={{ opacity: 0, x: i === 0 ? -24 : 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="bg-card border border-border rounded-xl p-7 flex flex-col gap-4 hover:border-primary/40 transition-smooth"
                data-ocid={system.ocid}
              >
                <h3 className="font-display text-xl font-bold text-foreground">
                  {system.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {system.desc}
                </p>
                <ul className="flex flex-wrap gap-2">
                  {system.modules.map((m) => (
                    <li
                      key={m}
                      className="px-2.5 py-1 rounded bg-secondary/70 border border-border font-mono text-xs text-muted-foreground"
                    >
                      {m}
                    </li>
                  ))}
                </ul>
                <Link to="/builder" className="mt-auto">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5 border-border hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                    data-ocid={`${system.ocid}.configure_button`}
                  >
                    Configure This System
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Modular */}
      <section
        data-ocid="home.why_modular_section"
        className="bg-background py-20"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="font-mono text-xs text-primary uppercase tracking-widest mb-3 block">
              The Advantage
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Why Modular?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {WHY_MODULAR.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-5 rounded-xl border border-border bg-card"
                data-ocid={`home.why_modular_item.${i + 1}`}
              >
                <h3 className="font-display text-sm font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        data-ocid="home.cta_section"
        className="bg-muted/40 border-t border-border py-20"
      >
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to configure your world?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Pick an environment, build your scene, and order the complete kit
              in minutes.
            </p>
            <Link to="/builder">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-display font-semibold px-10 gap-2 transition-smooth"
                data-ocid="home.final_cta_button"
              >
                <Settings2 className="w-4 h-4" />
                Start Building
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
