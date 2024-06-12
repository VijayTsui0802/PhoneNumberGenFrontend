<!-- src/components/AppFooter.vue -->
<template>
  <footer class="footer py-3 bg-dark text-white">
    <div class="container text-center">
      <div class="row">
        <div class="col-md-4">
          <h5>关于我们</h5>
          <p>我们是一家致力于提供高质量服务的公司。</p>
        </div>
        <div class="col-md-4">
          <h5>联系我们</h5>
          <p>Email: info@company.com</p>
          <p>Phone: +123 456 7890</p>
        </div>
        <div class="col-md-4">
          <h5>关注我们</h5>
          <a href="#" class="text-white me-2"><i class="fab fa-facebook-f"></i></a>
          <a href="#" class="text-white me-2"><i class="fab fa-twitter"></i></a>
          <a href="#" class="text-white me-2"><i class="fab fa-instagram"></i></a>
          <a href="#" class="text-white"><i class="fab fa-linkedin-in"></i></a>
        </div>
      </div>
      <hr class="my-3">
      <div class="row">
        <div class="col-12">
          <p class="mb-0">&copy; 2024 Your Company. All rights reserved.</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter'
};
</script>

<style scoped>
.footer {
  width: 100%;
  background-color: #343a40;
  color: #ffffff;
  padding: 20px 0;
}
.footer a {
  font-size: 1.5rem;
}
.footer hr {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
