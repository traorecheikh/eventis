# Flux d'inscription à un événement

Scénario le plus complexe du système : il mobilise trois services et une base.

## Cas nominal

```mermaid
sequenceDiagram
    participant F as Frontend Vue
    participant N as nginx
    participant R as registrations-service
    participant P as participants-service
    participant E as events-service
    participant DB as registrations-db

    F->>N: POST /api/registrations {eventId, participantId} + Bearer
    N->>R: POST /registrations
    R->>R: verifie le jeton localement (JWT_SECRET)
    R->>P: GET /participants/12
    P-->>R: 200 participant
    R->>E: GET /events/1/availability
    E->>R: GET /registrations/stats/event/1
    R-->>E: 200 {confirmedCount: 87}
    E-->>R: 200 {remainingSeats: 33, isFull: false}
    R->>DB: verifie l'absence d'inscription confirmee
    DB-->>R: aucune
    R->>DB: INSERT registration
    DB-->>R: id 501
    R-->>N: 201 inscription creee
    N-->>F: 201
```

Noter la boucle : `events-service` interroge `registrations-service` pour compter les
inscrits, alors que `registrations-service` interroge `events-service` pour connaître
la capacité. Ce n'est pas une dépendance circulaire bloquante car les deux points
d'entrée concernés sont différents et sans état, mais cela impose un timeout strict
de 3 secondes pour éviter tout blocage mutuel.

## Cas d'erreur

```mermaid
flowchart TD
    A["POST /registrations"] --> B{Corps valide}
    B -->|non| B1["400 VALIDATION_ERROR"]
    B -->|oui| C{Jeton valide}
    C -->|non| C1["401 UNAUTHORIZED"]
    C -->|oui| D{Participant existe}
    D -->|404| D1["404 PARTICIPANT_NOT_FOUND"]
    D -->|injoignable| D2["503 SERVICE_UNAVAILABLE"]
    D -->|oui| E{Evenement existe}
    E -->|404| E1["404 EVENT_NOT_FOUND"]
    E -->|injoignable| E2["503 SERVICE_UNAVAILABLE"]
    E -->|oui| F{Places restantes}
    F -->|isFull| F1["409 EVENT_FULL"]
    F -->|oui| G{Deja inscrit}
    G -->|oui| G1["409 ALREADY_REGISTERED"]
    G -->|non| H["INSERT"]
    H --> I{Erreur 23505}
    I -->|oui| G1
    I -->|non| J["201 cree"]
```

## Principe directeur

En cas de doute, refuser. Si `participants-service` ou `events-service` est
injoignable, le service renvoie `503` et n'inscrit personne. Une inscription refusée
à tort se retente en un clic. Un surbooking se répare difficilement le jour de
l'événement.

## Garde-fou en base

```sql
CREATE UNIQUE INDEX idx_registrations_unique_active
  ON registrations (event_id, participant_id)
  WHERE status = 'confirmee';
```

Deux requêtes concurrentes peuvent toutes deux passer la vérification applicative.
Seule cette contrainte de base tranche. Le service attrape le code d'erreur
PostgreSQL `23505` et renvoie `409 ALREADY_REGISTERED`.

Cet index ne protège pas contre le dépassement de capacité par deux personnes
différentes sur la dernière place. Ce risque résiduel est enregistré sous R-06 et
documenté dans le rapport comme amélioration possible.
