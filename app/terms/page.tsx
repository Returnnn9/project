"use client"

import React from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
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
            Пользовательское соглашение
          </h1>

          <div className="prose prose-smusl max-w-none text-smusl-brown/80 space-y-8 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-smusl-brown mb-4">1. Предмет соглашения</h2>
              <p>
                Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует отношения между Администрацией сайта «СМЫСЛ ЕСТЬ» и физическим лицом — Пользователем ресурса. Соглашение вступает в силу с момента начала использования Пользователем сайта.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-smusl-brown mb-4">2. Права и обязанности сторон</h2>
              <p>
                2.1. Пользователь имеет право просматривать каталог товаров, оформлять заказы и пользоваться личным кабинетом.<br />
                2.2. Пользователь обязан предоставлять достоверную информацию при регистрации и оформлении заказа.<br />
                2.3. Администрация сайта имеет право изменять условия соглашения без предварительного уведомления пользователей.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-smusl-brown mb-4">3. Ответственность</h2>
              <p>
                3.1. Администрация сайта не несет ответственности за перебои в работе сервиса, вызванные техническими неполадками на стороне третьих лиц.<br />
                3.2. Пользователь несет персональную ответственность за сохранность своих учетных данных.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-smusl-brown mb-4">4. Интеллектуальная собственность</h2>
              <p>
                Все материалы, размещенные на сайте (тексты, изображения, дизайн), являются интеллектуальной собственностью «СМЫСЛ ЕСТЬ» и защищены законом об авторском праве.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-smusl-brown mb-4">5. Срок действия</h2>
              <p>
                Настоящее соглашение действует бессрочно и может быть прекращено в случае его нарушения одной из сторон.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-smusl-brown mb-4">6. Контакты</h2>
              <p>
                По всем вопросам, связанным с использованием сайта, вы можете обращаться по адресу: info@smislest.ru
              </p>
            </section>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
