export interface AboutData {
  passion_title?: string;
  passion_text?: string;
  pride_title?: string;
  pride_text?: string;
  mission_title?: string;
  mission_text?: string;
  image_main?: any;
  image_top_right?: any;
  image_bottom_left?: any;
  image_bottom_right?: any;
  image_extra1?: any;
}

export async function getAboutData(): Promise<AboutData> {
  return {
    passion_title: 'Мы горим своим делом',
    passion_text: '«Смысл есть» — это пекарня в Москве, специализирующаяся на производстве безглютенового хлеба и выпечки.',
    pride_title: 'гордимся',
    pride_text: 'Мы первыми в России стали импортёрами тефовой муки и сегодня работаем с широким спектром альтернативных видов сырья: амарантовой, рисовой, гречневой, кукурузной, овсяной, ореховой и других мучных смесей. В ассортименте бренда «Смысл есть», более 20 видов продукции: от хлеба до десертов, созданных с заботой о здоровье и вкусе.',
    mission_title: 'наша миссия',
    mission_text: 'Создавать вкусную и безопасную безглютеновую продукцию с чистым составом. Мы стремимся к тому, чтобы питание стало осознанным, понятным и по-настоящему вкусным - без компромиссов между пользой и удовольствием',
    image_main: '/lending/staf1.png',
    image_top_right: '/lending/staf2.png',
    image_bottom_left: '/lending/staf3.png',
    image_bottom_right: '/lending/staf4.png',
    image_extra1: '/lending/staf5.png',
  };
}
