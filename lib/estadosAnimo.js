// Cada estado de ánimo tiene 2 referencias bíblicas (el texto se trae en vivo
// con buscarVersiculo, para no depender de una sola versión fija) y una oración
// corta original, escrita para ese sentimiento específico.

export const ESTADOS_DE_ANIMO = [
  {
    valor: 'ansioso',
    etiqueta: 'Ansioso',
    emoji: '😟',
    referencias: ['Filipenses 4:6-7', 'Mateo 6:34'],
    oracion: 'Señor, te entrego esta ansiedad. Ayúdame a confiar en que tú ya estás obrando, aunque yo no lo vea todavía.',
  },
  {
    valor: 'triste',
    etiqueta: 'Triste',
    emoji: '😢',
    referencias: ['Salmos 34:18', 'Salmos 147:3'],
    oracion: 'Padre, gracias porque estás cerca de mí en este dolor. Sana mi corazón y dame consuelo hoy.',
  },
  {
    valor: 'con_miedo',
    etiqueta: 'Con miedo',
    emoji: '😨',
    referencias: ['Isaías 41:10', '2 Timoteo 1:7'],
    oracion: 'Dios, reemplaza mi miedo con tu paz. Recuérdame que no estoy solo y que tú peleas por mí.',
  },
  {
    valor: 'cansado',
    etiqueta: 'Cansado',
    emoji: '😔',
    referencias: ['Mateo 11:28', 'Isaías 40:31'],
    oracion: 'Señor, estoy agotado. Dame descanso verdadero y renueva mis fuerzas como prometes.',
  },
  {
    valor: 'agradecido',
    etiqueta: 'Agradecido',
    emoji: '🙏',
    referencias: ['1 Tesalonicenses 5:18', 'Salmos 100:4'],
    oracion: 'Gracias, Dios, por todo lo que me has dado. Que mi vida hoy sea una ofrenda de gratitud.',
  },
  {
    valor: 'con_dudas',
    etiqueta: 'Con dudas',
    emoji: '🤔',
    referencias: ['Santiago 1:5-6', 'Proverbios 3:5-6'],
    oracion: 'Padre, no tengo todas las respuestas, pero elijo confiar en ti. Dame sabiduría para este momento.',
  },
  {
    valor: 'solo',
    etiqueta: 'Solo',
    emoji: '😞',
    referencias: ['Deuteronomio 31:6', 'Salmos 68:6'],
    oracion: 'Señor, recuérdame que nunca estoy verdaderamente solo, porque tú estás conmigo siempre.',
  },
  {
    valor: 'feliz',
    etiqueta: 'Feliz',
    emoji: '😊',
    referencias: ['Nehemías 8:10', 'Filipenses 4:4'],
    oracion: 'Gracias por este gozo, Dios. Que se refleje en cómo trato a los demás hoy.',
  },
];