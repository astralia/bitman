Cosas que hacer y notas
======================================================================

Espacio reservado vs tamaño
---------------------------------------------------------------------
Finalmente he puesto que el espacion reservado y el tamaño puedan ser
diferentes: 10 bits -> 2 bytes

En ningún caso se hacen comprobaciones, por lo que en algunas operaciones el
resultado puede ser errático.
Por ejemplo: si se reservan 10bits y se ponen a 1, al contar el número de bits
va a dar como resultado 16 en vez de 10!!!

Debería encontrar alguna manera de solucionarlo poco costosa. ¿Quizá limitar el
método fill1() a que rellene sólo hasta el máximo tamaño establecido?

Operaciones de rango
---------------------------------------------------------------------
No se están haciendo comprobaciones entre las posiciones inicial y final.
Haciendo un test, he visto que cascaba con el clearRg(0, 0), pero no con otros
valores mayores iguales (?????).

Tengo que revisarlo.
