"use client"

import React from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FDF8ED] font-manrope">
      <Header showCategories={false} />
      
      <main className="max-w-4xl mx-auto px-6 py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-smusl-terracotta font-bold mb-8 hover:gap-3 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад на главную
          </Link>

          <h1 className="text-3xl sm:text-4xl font-black text-smusl-brown mb-8 tracking-tight">
            Политика конфиденциальности
          </h1>

          <div className="prose prose-smusl max-w-none text-smusl-brown/80 space-y-8 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-smusl-brown mb-4">1. Сбор и использование данных</h2>
              <p>
                Мы собираем персональные данные (имя, номер телефона, адрес), которые вы предоставляете при оформлении заказа или регистрации. Эти данные необходимы для обеспечения доставки и качественного обслуживания.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-smusl-brown mb-4">2. Обработка персональных данных</h2>
              <p>
                Ваши данные используются исключительно для выполнения обязательств по договору купли-продажи, информирования о статусе заказа и персонализации сервиса.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-smusl-brown mb-4">3. Третьи стороны</h2>
              <p>
                Мы передаем ваши данные только тем службам, которые непосредственно задействованы в процессе доставки вашего заказа (курьерские службы) и обработки платежей. Мы не продаем и не обмениваем ваши данные для маркетинговых целей сторонних компаний.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-smusl-brown mb-4">4. Безопасность</h2>
              <p>
                Мы принимаем все необходимые меры для защиты ваших данных от несанкционированного доступа. Платежные данные обрабатываются через защищенные шлюзы банков.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-smusl-brown mb-4">5. Ваши права</h2>
              <p>
                Вы имеете право в любой момент запросить информацию о ваших данных, потребовать их исправления или удаления. Для этого свяжитесь с нами по электронной почте.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-smusl-brown mb-4">6. Контактная информация</h2>
              <p>
                Если у вас есть вопросы по поводу нашей политики конфиденциальности, пожалуйста, напишите нам: info@smislest.ru
              </p>
            </section>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
