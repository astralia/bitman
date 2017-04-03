Cosas que hacer y notas
======================================================================

allocate(n) y size()
---------------------------------------------------------------------
Actualmente se reservan bytes completos, por lo que he puesto que el tamaño sea
el máximo número de bits que cabrían en el espacio reservado: si quieres
reservar 10 bits, va a reservar 16, y por tanto éste será el valor que devuelva
size().

Quizá debería conservar el valor original, pero... ¿qué ocurriría si se quiere
poner todo a uno? ¿Habría que poner sólo a unos hasta el máximo indicado?
Con una máscara de rango podría hacer algo de eso, pero no sé si es lo que se
quiere, ya que aunque se trabaje con los bits, en el fondo no deja de ser un
array de bytes y puede que interese poder hacer uso de un byte entero. No sé, no
lo tengo muy claro.

* Resumen: de momento está tomando el byte completo. Quizá lo cambie.

and(BitArray8) y or(BitArray8)
----------------------------------------------------------------------
Debería poder hacerse con objetos de distinto tamaño pero, ¿el objeto resultante
debería tener el mismo tamaño que el inicial, o se "redimensionaría" para tener
el tamaño del que se pasa como argumento, si fuese mayor?
