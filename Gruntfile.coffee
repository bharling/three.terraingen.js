module.exports = (grunt) ->
  require('jit-grunt') grunt
  
  grunt.initConfig
  
    uglify:
      production:
        options:
          compress:true
          
        files:
          'dist/min/three.terrain.min.js': 'dist/three.terrain.js'
  
    coffee:
      compileJoined:
        options:
          join: true
        files:
          'dist/three.terrain.js':
            [
              'src/namespace.coffee',
              'src/providers/RNGProvider.coffee',
              'src/providers/NoiseProvider.coffee',
              'src/providers/NoiseModifierProvider.coffee',
              'src/providers/HeightMapProvider.coffee',
              'src/providers/GeometryProvider.coffee',
              'src/providers/MeshProvider.coffee',
              'src/providers/PatchProvider.coffee',
              'src/providers/FilterProvider.coffee'
            ]
            
    watch:
      coffee:
        files: ['src/coffee/**/*.coffee']
        tasks:
          [
            'coffee'
          ]

  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  
  grunt.registerTask 'default', ['coffee']
