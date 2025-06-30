import fetch from 'node-fetch';

async function testPodcastStructuredResponse() {
  try {
    console.log('🧪 Probando respuesta estructurada de podcasts...\n');
    
    const response = await fetch('http://localhost:3001/api/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: '¿Qué episodios hablan sobre mujeres emprendedoras?',
        conversationId: 'test-structured'
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('✅ Respuesta recibida:');
    console.log('📊 Clasificación:', data.classification);
    console.log('💬 Respuesta:', data.response);
    console.log('🎧 Podcasts encontrados:', data.podcasts ? data.podcasts.length : 0);
    
    if (data.podcasts && data.podcasts.length > 0) {
      console.log('\n📺 Detalles de los podcasts:');
      data.podcasts.forEach((podcast, index) => {
        console.log(`\n${index + 1}. ${podcast.title}`);
        console.log(`   Descripción: ${podcast.description.substring(0, 100)}...`);
        console.log(`   URL: ${podcast.video_url}`);
        console.log(`   Thumbnail: ${podcast.thumbnail}`);
        console.log(`   Inicio: ${podcast.start} segundos`);
      });
    }
    
    console.log('\n🎯 Estructura JSON completa:');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

testPodcastStructuredResponse(); 