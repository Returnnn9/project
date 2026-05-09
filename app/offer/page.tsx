"use client"

import React from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function OfferPage() {
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
            Публичная оферта
          </h1>

          <div className="prose prose-smusl max-w-none text-smusl-brown/80 space-y-8 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-smusl-brown mb-4">1. Общие положения</h2>
              <p>
                Настоящая Публичная оферта (далее — «Оферта») является официальным предложением интернет-магазина «СМЫСЛ ЕСТЬ» (далее — «Продавец») заключить договор купли-продажи товаров дистанционным способом на условиях, изложенных ниже.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-smusl-brown mb-4">2. Предмет договора</h2>
              <p>
                Продавец обязуется передать Покупателю Товар, предназначенный для личного, семейного, домашнего или иного использования, не связанного с предпринимательской деятельностью, на основании размещенных Заказов, а Покупатель обязуется принять и оплатить Товар на условиях настоящей Оферты.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-smusl-brown mb-4">3. Оформление Заказа</h2>
              <p>
                3.1. Заказ Товара осуществляется Покупателем через сервис интернет-магазина на сайте или через мобильное приложение.<br />
                3.2. При регистрации или оформлении заказа Покупатель обязуется предоставить достоверную контактную информацию.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-smusl-brown mb-4">4. Цена и оплата</h2>
              <p>
                4.1. Цена Товара указывается на сайте и может быть изменена Продавцом в одностороннем порядке до момента оформления Заказа.<br />
                4.2. Оплата производится банковской картой онлайн или через СБП в момент оформления Заказа.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-smusl-brown mb-4">5. Доставка и приемка</h2>
              <p>
                5.1. Доставка осуществляется по адресам, указанным Покупателем при оформлении Заказа, в пределах зон обслуживания, указанных на карте.<br />
                5.2. Срок доставки является ориентировочным и может зависеть от загруженности службы доставки и дорожной ситуации.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-smusl-brown mb-4">6. Реквизиты продавца</h2>
              <div className="bg-white/50 p-6 rounded-2xl border border-smusl-clay shadow-sm italic">
                ООО «СМЫСЛ ЕСТЬ»<br />
                ИНН/КПП: 7712345678/771201001<br />
                ОГРН: 1234567890123<br />
                Адрес: г. Москва, ул. Ижорская, д. 3<br />
                Email: info@smislest.ru
              </div>
            </section>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
