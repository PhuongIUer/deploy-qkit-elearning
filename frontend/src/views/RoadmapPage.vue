<template>
  <div class="roadmap-container">
    <h1>Developer Roadmaps</h1>
    <p class="subtitle">Step by step guides and paths to learn different tools or technologies</p>
    
    <div class="roadmap-grid">
      <RoadmapCard 
        title="DevOps Roadmap" 
        description="Learn what DevOps tools and skills you need to become a DevOps engineer"
        icon="🛠️"
        link="https://roadmap.sh/devops"
      />
      <RoadmapCard 
        title="Backend Roadmap" 
        description="Step by step guide to becoming a modern backend developer"
        icon="⚙️"
        link="https://roadmap.sh/backend"
      />
      <RoadmapCard 
        title="Frontend Roadmap" 
        description="Step by step guide to becoming a modern frontend developer"
        icon="🖥️"
        link="https://roadmap.sh/frontend"
      />
      <RoadmapCard 
        title="Full Stack Roadmap" 
        description="Step by step guide to becoming a modern full stack developer"
        icon="🔗"
        link="https://roadmap.sh/full-stack"
      />
      <RoadmapCard 
        title="AWS Roadmap" 
        description="Step by step guide to learning AWS"
        icon="☁️"
        link="https://roadmap.sh/aws"
      />
      <RoadmapCard 
        title="Vue Roadmap" 
        description="Step by step guide to becoming a Vue.js developer"
        icon="🟢"
        link="https://roadmap.sh/vue"
      />
      <RoadmapCard 
        title="C++ Roadmap" 
        description="Step by step guide to learning C++"
        icon="➕"
        link="https://roadmap.sh/cpp"
      />
      <RoadmapCard 
        title="Python Roadmap" 
        description="Step by step guide to learning Python"
        icon="🐍"
        link="https://roadmap.sh/python"
      />
      <RoadmapCard 
        title="Git/GitHub Roadmap" 
        description="Step by step guide to learning Git and GitHub"
        icon="⎇"
        link="https://roadmap.sh/git-github"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import RoadmapCard from '../components/shared/RoadmapCard.vue';
</script>

<style scoped>
.roadmap-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin-bottom: 2rem;
}

.roadmap-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .roadmap-grid {
    grid-template-columns: 1fr;
  }
}
</style>